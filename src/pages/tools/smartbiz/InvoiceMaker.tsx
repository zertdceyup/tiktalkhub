import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TikoAI from '@/components/TikoAI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { Download, FileText, Plus, Trash2, Calculator } from 'lucide-react';
import SEO from '@/components/SEO';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

const InvoiceMaker: React.FC = () => {
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => `INV-${Date.now().toString().slice(-6)}`);
  const [businessInfo, setBusinessInfo] = useState<any>({ name: '', address: '', city: '', email: '', phone: '', taxRate: 0 });
  const [clientInfo, setClientInfo] = useState<any>({ name: '', address: '', city: '', email: '' });
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, rate: 0 }]);
  const [dueDate, setDueDate] = useState<string>(() => new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('Thank you for your business!');
  const [generatePDF, setGeneratePDF] = useState<boolean>(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [taxMode, setTaxMode] = useState<'exclusive'|'inclusive'>('exclusive');
  const [discount, setDiscount] = useState<number>(0);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBusinessInfo((b: any) => ({ ...b, logoDataUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.rate) || 0), 0), [items]);
  const tax = useMemo(() => subtotal * ((Number(businessInfo.taxRate) || 0) / 100), [subtotal, businessInfo.taxRate]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const { data: blogData } = useQuery({
    queryKey: ['smartbiz-blogs-invoice'],
    queryFn: async () => (await api.getBlogPosts({ category: 'smartbiz', limit: 6 })).data,
  });

  const { mutate: createInvoice, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.createInvoice({ invoiceNumber, businessInfo, clientInfo, items, dueDate, notes });
      return res.data as any;
    },
    onSuccess: (data: any) => {
      if (data?.invoice) {
        // Request PDF explicitly
        generatePdfNow();
      }
    },
    onError: (err: any) => alert(getErrorMessage(err))
  });

  const { mutate: generatePdfNow, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/tools/smartbiz/invoice-maker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceNumber, businessInfo, clientInfo, items, dueDate, notes, generatePDF: true, currency, taxMode, discount })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to generate PDF');
      return json.data;
    },
    onSuccess: (data: any) => {
      if (data?.pdfUrl) setPdfUrl(data.pdfUrl);
    },
    onError: (err: any) => alert(getErrorMessage(err))
  });

  const addItem = () => setItems(prev => [...prev, { description: '', quantity: 1, rate: 0 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, patch: Partial<InvoiceItem>) => setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));

  return (
    <div className="min-h-screen">
      <SEO
        title="Invoice Maker | SmartBiz | Tiktalkhub"
        description="Create professional invoices with tax modes, discounts, currency selection, and instant PDF export. Free online invoice generator."
        keywords={["invoice maker","free invoice generator","create invoice PDF","invoice with tax","invoice discounts","business invoicing"]}
        canonical="/tools/smartbiz/invoice-maker"
        openGraph={{ title: 'Invoice Maker | Tiktalkhub', description: 'Create professional invoices with instant PDF export', type: 'website', url: typeof window !== 'undefined' ? window.location.href : '' }}
        twitter={{ card: 'summary_large_image', title: 'Invoice Maker | Tiktalkhub', description: 'Create professional invoices with instant PDF export' }}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Invoice Maker - Tiktalkhub',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any',
          url: typeof window !== 'undefined' ? window.location.href : '',
          offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' }
        }}
      />
      <Header />

      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-gradient-to-r from-primary/20 to-gold/20 text-primary border-primary/30">
                <FileText className="w-4 h-4 mr-2" /> SmartBiz • Invoice Maker
              </Badge>
              <h1 className="text-4xl font-bold">
                Create Professional Invoices</h1>
              <p className="text-muted-foreground">Auto-calculations, tax support, notes, and instant PDF export.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>Invoice Details</CardTitle>
                    <CardDescription>Business, client, items, and totals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Invoice #</Label>
                        <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Rate (%)</Label>
                        <Input type="number" value={businessInfo.taxRate}
                          onChange={e => setBusinessInfo({ ...businessInfo, taxRate: Number(e.target.value) })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <select className="w-full h-10 rounded-md border bg-background px-3" value={currency} onChange={e => setCurrency(e.target.value)}>
                          {['USD','EUR','GBP','CAD','AUD','INR','JPY','CNY','ZAR','NGN','BRL','MXN'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tax Mode</Label>
                        <select className="w-full h-10 rounded-md border bg-background px-3" value={taxMode} onChange={e => setTaxMode(e.target.value as any)}>
                          <option value="exclusive">Exclusive</option>
                          <option value="inclusive">Inclusive</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Overall Discount (%)</Label>
                        <Input type="number" min={0} max={100} value={discount}
                          onChange={e => setDiscount(Number(e.target.value))} />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold">Business Info</h3>
                        <Input placeholder="Business Name" value={businessInfo.name} onChange={e => setBusinessInfo({ ...businessInfo, name: e.target.value })} />
                        <Input placeholder="Address" value={businessInfo.address} onChange={e => setBusinessInfo({ ...businessInfo, address: e.target.value })} />
                        <Input placeholder="City, State" value={businessInfo.city} onChange={e => setBusinessInfo({ ...businessInfo, city: e.target.value })} />
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Email" value={businessInfo.email} onChange={e => setBusinessInfo({ ...businessInfo, email: e.target.value })} />
                          <Input placeholder="Phone" value={businessInfo.phone} onChange={e => setBusinessInfo({ ...businessInfo, phone: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label>Logo (optional)</Label>
                          <Input type="file" accept="image/*" onChange={handleLogo} />
                          {businessInfo.logoDataUrl && (
                            <img src={businessInfo.logoDataUrl} alt="logo" className="h-12 mt-2 object-contain" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold">Client Info</h3>
                        <Input placeholder="Client Name" value={clientInfo.name} onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })} />
                        <Input placeholder="Address" value={clientInfo.address} onChange={e => setClientInfo({ ...clientInfo, address: e.target.value })} />
                        <Input placeholder="City, State" value={clientInfo.city} onChange={e => setClientInfo({ ...clientInfo, city: e.target.value })} />
                        <Input placeholder="Email" value={clientInfo.email} onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Items</h3>
                        <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
                      </div>
                      <div className="space-y-3">
                        {items.map((it, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6">
                              <Input placeholder="Description" value={it.description} onChange={e => updateItem(idx, { description: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                              <Input type="number" min={0} placeholder="Qty" value={it.quantity}
                                onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} />
                            </div>
                            <div className="col-span-2">
                              <Input type="number" min={0} step="0.01" placeholder="Rate" value={it.rate}
                                onChange={e => updateItem(idx, { rate: Number(e.target.value) })} />
                            </div>
                            <div className="col-span-1">
                              <Input type="number" min={0} max={100} placeholder="Disc%" value={(it as any).discount || 0}
                                onChange={e => updateItem(idx, { discount: Number(e.target.value) } as any)} />
                            </div>
                            <div className="col-span-1 text-right font-medium">
                              ${(it.quantity * it.rate * (1 - ((it as any).discount || 0)/100)).toFixed(2)}
                            </div>
                            <div className="col-span-1 text-right">
                              <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} aria-label="Remove">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 items-start">
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea rows={5} value={notes} onChange={e => setNotes(e.target.value)} />
                      </div>
                      <div className="space-y-2 border rounded-md p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span>Discount ({discount}%)</span>
                            <span>-${(subtotal * (discount/100)).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span>{taxMode === 'inclusive' ? 'Included Tax' : 'Tax'}</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-3 mt-3">
                          <Button className="flex-1" onClick={() => createInvoice()} disabled={isPending}>
                            <Calculator className="w-4 h-4 mr-2" /> Calculate
                          </Button>
                          <Button className="flex-1 btn-gold" onClick={() => generatePdfNow()} disabled={isGenerating}>
                            <Download className="w-4 h-4 mr-2" /> Generate PDF
                          </Button>
                        </div>
                        {pdfUrl && (
                          <a href={pdfUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary mt-2">Download latest PDF</a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>How it works</CardTitle>
                    <CardDescription>Tips and FAQs</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-3">
                    <p>Fill in business and client details, add line items, set your tax rate, and click Generate PDF. Your invoice is produced instantly and hosted at a secure URL.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Supports percentage-based tax</li>
                      <li>Auto totals update as you edit items</li>
                      <li>Use Notes for payment terms and thanks</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="tiktok-card">
                  <CardHeader>
                    <CardTitle>SmartBiz Reads</CardTitle>
                    <CardDescription>Curated posts for small businesses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {blogData?.posts?.slice(0, 6).map((post: any) => (
                        <div key={post.id} className="group cursor-pointer">
                          <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                        </div>
                      ))}
                      {!blogData?.posts?.length && (
                        <p className="text-sm text-muted-foreground">No posts yet. Add SmartBiz posts from the admin dashboard.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <TikoAI />
    </div>
  );
};

export default InvoiceMaker;