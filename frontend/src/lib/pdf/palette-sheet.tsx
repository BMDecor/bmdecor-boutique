import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

interface PaletteColor {
  brand: string;
  colorCode: string;
  colorName: string;
  hexCode: string;
  notes?: string;
}

interface PaletteSheetProps {
  projectName: string;
  colors: PaletteColor[];
  date: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 40,
    paddingVertical: 30,
    fontFamily: 'Helvetica',
  },

  // Header
  headerBar: {
    backgroundColor: '#C9A86C',
    borderRadius: 4,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  headerProject: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 6,
    opacity: 0.9,
  },
  headerDate: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
  },

  // Swatches grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  swatch: {
    width: '30%',
    marginBottom: 8,
  },
  colorRect: {
    height: 80,
    borderRadius: 4,
    border: '1 solid #E0DCD6',
  },
  brandBadge: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#8A8580',
    marginTop: 6,
  },
  colorName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#2C2C2C',
    marginTop: 2,
  },
  colorCode: {
    fontSize: 10,
    color: '#9E9A95',
    marginTop: 1,
  },
  colorNotes: {
    fontSize: 8,
    color: '#B0ACA7',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#9E9A95',
  },
});

export default function PaletteSheet({ projectName, colors, date }: PaletteSheetProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>BM Decoracion</Text>
          <Text style={styles.headerProject}>{projectName}</Text>
          <Text style={styles.headerDate}>{date}</Text>
        </View>

        {/* Color Swatches Grid */}
        <View style={styles.grid}>
          {colors.map((color, index) => (
            <View key={index} style={styles.swatch}>
              <View style={[styles.colorRect, { backgroundColor: color.hexCode }]} />
              <Text style={styles.brandBadge}>{color.brand}</Text>
              <Text style={styles.colorName}>{color.colorName}</Text>
              <Text style={styles.colorCode}>{color.colorCode}</Text>
              {color.notes && <Text style={styles.colorNotes}>{color.notes}</Text>}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            bmdecor.es | Calle Dublin 21, Marbella
          </Text>
        </View>
      </Page>
    </Document>
  );
}
