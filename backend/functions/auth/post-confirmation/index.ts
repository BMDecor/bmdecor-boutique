import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';
import type { PostConfirmationTriggerEvent } from 'aws-lambda';

const ses = new SESClient({ region: 'eu-west-1' });
const cognito = new CognitoIdentityProviderClient({ region: 'eu-west-1' });
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'derfischer1778@gmail.com';

export const handler = async (event: PostConfirmationTriggerEvent): Promise<PostConfirmationTriggerEvent> => {
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    return event;
  }

  const email = event.request.userAttributes.email;
  const displayName = event.request.userAttributes['custom:display_name'] || 'there';

  // Auto-assign Customer group
  try {
    await cognito.send(new AdminAddUserToGroupCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: 'Customer',
    }));
    console.log(`Added ${email} to Customer group`);
  } catch (error) {
    console.error('Failed to add user to Customer group:', error);
  }

  const htmlBody = [
    '<div style="background-color:#1a1a1a;padding:40px 20px;font-family:Georgia,serif;">',
    '<div style="max-width:480px;margin:0 auto;text-align:center;">',
    '<h1 style="color:#c5a065;font-size:28px;margin-bottom:8px;">BM Decoraci&oacute;n</h1>',
    `<p style="color:#e0e0e0;font-size:18px;margin-bottom:24px;">Welcome, ${displayName}!</p>`,
    '<p style="color:#cccccc;font-size:14px;line-height:1.6;margin-bottom:24px;">',
    'Your account has been verified. Welcome to the Digital Design Studio &mdash; your personal space ',
    'to explore curated collections from Benjamin Moore, Farrow &amp; Ball, and Little Greene.</p>',
    '<a href="https://bmdecor.es/my-studio" style="display:inline-block;background-color:#c5a065;color:#1a1a1a;',
    'padding:14px 36px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;">',
    'Enter My Studio</a>',
    '<hr style="border:none;border-top:1px solid #333;margin:32px 0 16px;" />',
    '<p style="color:#666666;font-size:11px;">BM Decoraci&oacute;n &middot; Calle Dubl&iacute;n 21, Marbella, Spain</p>',
    '<p style="color:#666666;font-size:11px;">',
    '<a href="https://bmdecor.es/unsubscribe" style="color:#c5a065;">Unsubscribe</a>',
    ' &middot; <a href="https://bmdecor.es/privacy" style="color:#c5a065;">Privacy Policy</a></p>',
    '</div></div>',
  ].join('');

  const textBody = `Welcome to BM Decoracion, ${displayName}! Your account is now verified. Visit https://bmdecor.es/my-studio to explore your personal Design Studio. Unsubscribe: https://bmdecor.es/unsubscribe`;

  try {
    await ses.send(new SendEmailCommand({
      Source: `BM Decoracion <${SENDER_EMAIL}>`,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'Welcome to the Atelier | BM Decoracion' },
        Body: {
          Html: { Data: htmlBody },
          Text: { Data: textBody },
        },
      },
    }));
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  return event;
};
