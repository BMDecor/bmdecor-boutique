'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Upload, Trash2, ImageIcon, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  colorCode: string;
}

interface ImageFile {
  key: string;
  filename: string;
  size: number;
  lastModified: string;
  url: string;
}

export default function ImagesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/admin/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            brand: p.brand as string,
            colorCode: p.colorCode as string,
          })));
        }
      } catch { /* ignore */ }
    }
    loadProducts();
  }, []);

  async function loadImages(productId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/images?productId=${productId}`);
      if (res.ok) setImages(await res.json());
    } catch {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    setShowProductList(false);
    setProductSearch('');
    loadImages(product.id);
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !selectedProduct) return;
    setUploading(true);

    let successCount = 0;
    for (const file of Array.from(files)) {
      try {
        // Get presigned URL
        const urlRes = await fetch('/api/admin/images/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: selectedProduct.id,
            filename: file.name,
            contentType: file.type,
          }),
        });
        if (!urlRes.ok) throw new Error();
        const { uploadUrl } = await urlRes.json();

        // Upload directly to S3
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        if (!uploadRes.ok) throw new Error();
        successCount++;
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} image${successCount > 1 ? 's' : ''} uploaded`);
      loadImages(selectedProduct.id);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function deleteImage(key: string) {
    try {
      const res = await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) throw new Error();
      setImages((prev) => prev.filter((img) => img.key !== key));
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.colorCode.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C]">Images</h1>
        <p className="text-[#2C2C2C]/50 text-sm mt-1">Manage product images stored in S3</p>
      </div>

      {/* Product selector */}
      <div className="space-y-2">
        <Label>Select Product</Label>
        <div className="relative max-w-lg">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2C2C2C]/30" />
              <Input
                placeholder="Search products by name, code, or brand..."
                value={selectedProduct ? `${selectedProduct.name} (${selectedProduct.brand})` : productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setSelectedProduct(null);
                  setShowProductList(true);
                }}
                onFocus={() => { if (!selectedProduct) setShowProductList(true); }}
                className="pl-9"
              />
            </div>
            {selectedProduct && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedProduct(null);
                  setImages([]);
                  setProductSearch('');
                }}
                className="text-[#2C2C2C]/40"
              >
                Clear
              </Button>
            )}
          </div>

          {showProductList && !selectedProduct && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-[#2C2C2C]/10 shadow-lg max-h-64 overflow-y-auto">
              {filteredProducts.slice(0, 30).map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProduct(p)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-[#FAF8F5] transition-colors"
                >
                  <span className="text-[#2C2C2C]">{p.name}</span>
                  <span className="text-xs text-[#2C2C2C]/40">{p.colorCode}</span>
                  <span className="text-xs px-1 py-0.5 rounded bg-[#2C2C2C]/5 text-[#2C2C2C]/50 ml-auto">{p.brand}</span>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="px-3 py-4 text-sm text-[#2C2C2C]/40 text-center">No products found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      {selectedProduct ? (
        <div className="space-y-4">
          {/* Upload area */}
          <div
            className="border-2 border-dashed border-[#2C2C2C]/15 rounded-lg p-8 text-center hover:border-[#C9A86C]/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#C9A86C]'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('border-[#C9A86C]'); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-[#C9A86C]');
              handleUpload(e.dataTransfer.files);
            }}
          >
            <Upload className="h-8 w-8 mx-auto text-[#2C2C2C]/20 mb-3" />
            <p className="text-sm text-[#2C2C2C]/60">
              {uploading ? 'Uploading...' : 'Drop images here or click to browse'}
            </p>
            <p className="text-xs text-[#2C2C2C]/30 mt-1">JPG, PNG, WebP, AVIF</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>

          {/* Image gallery */}
          {loading ? (
            <div className="p-8 text-center text-[#2C2C2C]/40 text-sm">Loading images...</div>
          ) : images.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg border border-[#2C2C2C]/8">
              <ImageIcon className="h-8 w-8 mx-auto text-[#2C2C2C]/20 mb-3" />
              <p className="font-[family-name:var(--font-playfair)] text-lg text-[#2C2C2C]/30">No images</p>
              <p className="text-sm text-[#2C2C2C]/40 mt-1">Upload images for {selectedProduct.name}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.key} className="bg-white rounded-lg border border-[#2C2C2C]/8 overflow-hidden group">
                  <div className="aspect-square relative bg-[#F5F5F5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-red-500 hover:text-red-600 hover:bg-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#FAF8F5]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Image</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete &quot;{img.filename}&quot;? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteImage(img.key)} className="bg-red-500 hover:bg-red-600 text-white">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-[#2C2C2C] truncate">{img.filename}</p>
                    <p className="text-xs text-[#2C2C2C]/40">{formatSize(img.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-[#2C2C2C]/40">
            {images.length} image{images.length !== 1 ? 's' : ''} for {selectedProduct.name}
          </p>
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-lg border border-[#2C2C2C]/8">
          <ImageIcon className="h-10 w-10 mx-auto text-[#2C2C2C]/15 mb-3" />
          <p className="font-[family-name:var(--font-playfair)] text-xl text-[#2C2C2C]/25">Select a product</p>
          <p className="text-sm text-[#2C2C2C]/40 mt-1">Choose a product above to manage its images.</p>
        </div>
      )}
    </div>
  );
}
