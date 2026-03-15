import React, { useState, useEffect } from "react";
import { 
  Phone, MapPin, Search, ChevronLeft, 
  Trash2, Camera, Edit3, MessageCircle, ArrowRight, Settings, Lock, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PHONE_NUMBER = "919447478429"; 
const DISPLAY_PHONE = "+91 9447478429";
const MAP_LINK = "https://www.google.com/maps/dir/11.3112413,75.75112/Cosmo+Fibres,+Pathoor+Tower+Room+no.1246+A1+Puthiyara+Rd+Nr.+Sabha+school+Kozhikode+4,+Kozhikode,+Kerala+673004/@11.2827178,75.7487465,14z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x3ba6598c23c00a7d:0xf2dfb76b77264f49!2m2!1d75.7877233!2d11.2553017";

const CATEGORIES = ["Ladies", "Gents", "Kids", "Others"];

export default function App() {
  const [view, setView] = useState("home"); 
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Admin / Security States
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // CRUD States
  const [isEditing, setIsEditing] = useState<string | null>(null); 
  const [form, setForm] = useState({
    name: "", category: "Ladies", price: "", desc: "", images: [] as string[]
  });

  // --- FETCH DATA ---
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  // --- ACTIONS ---
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setShowPasscodeModal(false);
        setView("admin");
        setPasscode("");
        setPasscodeError("");
      } else {
        setPasscodeError("Incorrect passcode");
      }
    } catch (err) {
      setPasscodeError("Authentication failed");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setForm(f => ({ ...f, images: [...f.images, reader.result as string] }));
      reader.readAsDataURL(file);
    });
  };

  const saveToInventory = async () => {
    if (!form.name || form.images.length === 0) return alert("Missing required fields.");
    
    try {
      if (isEditing) {
        await fetch(`/api/products/${isEditing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        setIsEditing(null);
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      }
      
      setForm({ name: "", category: "Ladies", price: "", desc: "", images: [] });
      fetchProducts();
      alert("Catalog successfully updated.");
    } catch (err) {
      console.error("Failed to save product", err);
      alert("Error saving product.");
    }
  };

  const removeProduct = async (id: string) => {
    if(window.confirm("Delete this product permanently?")) {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        fetchProducts();
      } catch (err) {
        console.error("Failed to delete product", err);
      }
    }
  };

  const startEdit = (product: any) => {
    setForm(product);
    setIsEditing(product.id);
    window.scrollTo(0, 0);
  };

  const getWhatsAppLink = (pName: string) => {
    const msg = encodeURIComponent(`Hi Cosmo Fibers, I am interested in ${pName}.`);
    return `https://wa.me/${PHONE_NUMBER}?text=${msg}`;
  };

  const customerGallery = products.filter(p => 
    (categoryFilter === "All" || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-royal-bg text-royal-text font-sans selection:bg-royal-gold selection:text-royal-bg">
      
      {/* --- 1. TOP TOGGLE BAR --- */}
      <div className="bg-royal-surface text-royal-muted h-10 flex justify-center items-center gap-8 text-xs font-medium tracking-widest fixed top-0 w-full z-50 border-b border-royal-border">
        <a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-2 hover:text-royal-gold transition-colors">
          <Phone size={14} /> CALL US
        </a>
        <div className="w-px h-4 bg-royal-border" />
        <a href={MAP_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-royal-gold transition-colors">
          <MapPin size={14} /> SHOP LOCATION
        </a>
      </div>

      {/* --- 2. NAVIGATION --- */}
      <nav className="h-24 px-6 md:px-12 flex justify-between items-center fixed top-10 w-full bg-royal-bg/90 backdrop-blur-md z-40 border-b border-royal-border">
        <div 
          className="font-serif text-2xl md:text-3xl font-bold tracking-wide cursor-pointer text-royal-text" 
          onClick={() => setView("home")}
        >
          COSMO <span className="text-royal-gold italic font-normal">Fibers</span>
        </div>
        <div className="flex items-center gap-6 md:gap-10">
          <button className="text-xs font-bold tracking-[0.2em] hover:text-royal-gold transition-colors" onClick={() => setView("home")}>HOME</button>
          <button className="text-xs font-bold tracking-[0.2em] hover:text-royal-gold transition-colors" onClick={() => setView("collection")}>COLLECTION</button>
          
          {/* Settings / Admin Icon */}
          <button 
            onClick={() => isAdmin ? setView("admin") : setShowPasscodeModal(true)}
            className="p-2 rounded-full hover:bg-royal-surface transition-colors text-royal-muted hover:text-royal-gold"
            title="Staff Access"
          >
            <Settings size={18} />
          </button>
        </div>
      </nav>

      {/* --- PASSCODE MODAL --- */}
      <AnimatePresence>
        {showPasscodeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-royal-surface p-8 rounded-xl shadow-2xl max-w-sm w-full relative border border-royal-border"
            >
              <button 
                onClick={() => setShowPasscodeModal(false)}
                className="absolute top-4 right-4 text-royal-muted hover:text-royal-text"
              >
                <X size={20} />
              </button>
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 rounded-full bg-royal-gold/10 flex items-center justify-center text-royal-gold border border-royal-gold/20">
                  <Lock size={24} />
                </div>
              </div>
              <h3 className="font-serif text-2xl text-center mb-2 text-royal-text">Staff Access</h3>
              <p className="text-center text-royal-muted text-sm mb-6">Enter passcode to manage inventory</p>
              
              <form onSubmit={handlePasscodeSubmit}>
                <input 
                  type="password" 
                  autoFocus
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter Passcode"
                  className="w-full px-4 py-3 bg-royal-bg border border-royal-border rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-gold focus:border-royal-gold text-center tracking-widest mb-4 text-royal-text placeholder:text-royal-muted/50"
                />
                {passcodeError && <p className="text-red-400 text-xs text-center mb-4">{passcodeError}</p>}
                <button 
                  type="submit"
                  className="w-full bg-royal-gold text-royal-bg py-3 rounded-lg font-bold tracking-wide hover:bg-white transition-colors"
                >
                  AUTHENTICATE
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-[136px] pb-24">
        <AnimatePresence mode="wait">
          
          {/* VIEW: HOME */}
          {view === "home" && (
            <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                <div>
                  <h4 className="text-xs uppercase text-royal-gold mb-4 tracking-[0.3em] font-semibold">Est. 1999 • Puthiyara Road</h4>
                  <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] mb-8 text-royal-text">
                    Premium Retail <br/>
                    <span className="text-royal-gold italic font-light">Elegance.</span>
                  </h1>
                  <p className="text-lg text-royal-muted leading-relaxed mb-10 max-w-md">
                    Established in 1999, Cosmo Fibers stands at Pathoor Tower, Puthiyara Road, Kozhikode. 
                    Top-notch product quality and customer centricity are core to our philosophy.
                  </p>
                  <button 
                    className="bg-royal-gold text-royal-bg px-8 py-4 rounded-sm font-bold tracking-widest text-xs hover:bg-white transition-all flex items-center gap-3"
                    onClick={() => setView("collection")}
                  >
                    EXPLORE SHOWROOM <ArrowRight size={16}/>
                  </button>
                </div>
                <div className="relative h-[500px] md:h-[700px] rounded-t-full overflow-hidden shadow-2xl shadow-black/50 border-8 border-royal-surface">
                  <img 
                    src="https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=2000&q=100" 
                    className="w-full h-full object-cover" 
                    alt="Royal Boutique Mannequins" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-bg/80 via-transparent to-transparent" />
                </div>
              </section>
            </motion.div>
          )}

          {/* VIEW: COLLECTION */}
          {view === "collection" && (
            <motion.div key="c" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-6 md:px-12 py-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                  <h4 className="text-xs uppercase text-royal-gold mb-2 tracking-[0.2em] font-semibold">Our Inventory</h4>
                  <h2 className="font-serif text-4xl md:text-5xl text-royal-text">The Collection</h2>
                </div>
                <div className="flex items-center gap-3 border-b border-royal-border pb-2 w-full md:w-72">
                  <Search size={18} className="text-royal-muted" />
                  <input 
                    placeholder="Search models..." 
                    className="bg-transparent border-none outline-none w-full text-sm text-royal-text placeholder:text-royal-muted"
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-12">
                {["All", ...CATEGORIES].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setCategoryFilter(cat)} 
                    className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                      categoryFilter === cat 
                        ? 'bg-royal-gold text-royal-bg shadow-md shadow-royal-gold/20' 
                        : 'border border-royal-border text-royal-muted hover:border-royal-gold hover:text-royal-gold'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {customerGallery.length === 0 ? (
                <div className="text-center py-24 text-royal-muted font-serif text-xl italic">
                  No products found in this category.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {customerGallery.map(p => (
                    <motion.div 
                      whileHover={{ y: -8 }}
                      key={p.id} 
                      className="bg-royal-surface group cursor-pointer border border-royal-border shadow-sm hover:shadow-xl hover:shadow-black/50 hover:border-royal-gold/50 transition-all duration-300"
                      onClick={() => { setSelectedProduct(p); setView("detail"); }}
                    >
                      <div className="h-[400px] overflow-hidden bg-royal-bg relative">
                        {p.images[0] ? (
                          <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" alt={p.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-royal-border"><Camera size={48} /></div>
                        )}
                        <div className="absolute top-4 left-4 bg-royal-bg/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-royal-gold border border-royal-gold/20">
                          {p.category}
                        </div>
                      </div>
                      <div className="p-6 text-center">
                        <h3 className="font-serif text-xl text-royal-text mb-2">{p.name}</h3>
                        <p className="text-royal-gold font-light">{p.price}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: PRODUCT DETAIL */}
          {view === "detail" && selectedProduct && (
            <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto px-6 md:px-12 py-8">
              <button 
                onClick={() => setView("collection")} 
                className="flex items-center gap-2 text-xs font-bold tracking-widest text-royal-gold hover:text-white transition-colors mb-8"
              >
                <ChevronLeft size={16}/> BACK TO GALLERY
              </button>
              
              <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                <div>
                  <div className="bg-royal-surface rounded-sm overflow-hidden h-[500px] md:h-[700px] mb-4 border border-royal-border">
                    {selectedProduct.images[0] ? (
                      <img src={selectedProduct.images[0]} className="w-full h-full object-cover" alt={selectedProduct.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-royal-border"><Camera size={64} /></div>
                    )}
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {selectedProduct.images.map((img: string, i: number) => (
                      <img key={i} src={img} className="w-20 h-24 object-cover cursor-pointer border border-royal-border hover:border-royal-gold transition-colors" alt={`Thumbnail ${i}`} />
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold tracking-[0.2em] text-royal-gold uppercase mb-4">{selectedProduct.category}</span>
                  <h1 className="font-serif text-4xl md:text-5xl text-royal-text mb-6 leading-tight">{selectedProduct.name}</h1>
                  <h2 className="text-2xl font-light text-royal-muted mb-8">{selectedProduct.price}</h2>
                  
                  <div className="w-12 h-px bg-royal-gold mb-8" />
                  
                  <p className="text-royal-muted leading-relaxed mb-12 whitespace-pre-line">
                    {selectedProduct.desc || "No description provided."}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href={getWhatsAppLink(selectedProduct.name)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex-1 bg-royal-gold text-royal-bg py-4 px-6 rounded-sm font-bold text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-colors"
                    >
                      <MessageCircle size={18}/> WHATSAPP INQUIRY
                    </a>
                    <a 
                      href={`tel:${PHONE_NUMBER}`} 
                      className="flex-1 border-2 border-royal-gold text-royal-gold py-4 px-6 rounded-sm font-bold text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-royal-gold hover:text-royal-bg transition-colors"
                    >
                      CALL NOW
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: STAFF INVENTORY MANAGEMENT */}
          {view === "admin" && isAdmin && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto px-6 py-12">
              <div className="bg-royal-surface p-8 md:p-12 rounded-xl shadow-2xl shadow-black/50 border border-royal-border">
                <div className="flex justify-between items-center mb-10 border-b border-royal-border pb-6">
                  <div>
                    <h4 className="text-xs uppercase text-royal-gold tracking-[0.2em] font-semibold mb-2">Staff Portal</h4>
                    <h2 className="font-serif text-3xl text-royal-text">{isEditing ? "Update Product" : "Manage Inventory"}</h2>
                  </div>
                  <button 
                    onClick={() => { setIsAdmin(false); setView("home"); }}
                    className="text-xs font-bold tracking-widest text-royal-muted hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    <Lock size={14} /> LOGOUT
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-royal-muted uppercase">Product Name</label>
                    <input 
                      className="w-full p-4 bg-royal-bg border border-royal-border text-royal-text rounded-sm focus:outline-none focus:border-royal-gold transition-colors placeholder:text-royal-muted/50" 
                      placeholder="e.g. Premium Display Mannequin" 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-royal-muted uppercase">Price / Range</label>
                    <input 
                      className="w-full p-4 bg-royal-bg border border-royal-border text-royal-text rounded-sm focus:outline-none focus:border-royal-gold transition-colors placeholder:text-royal-muted/50" 
                      placeholder="e.g. ₹4,500 - ₹6,000" 
                      value={form.price} 
                      onChange={e => setForm({...form, price: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-royal-muted uppercase">Category</label>
                    <select 
                      className="w-full p-4 bg-royal-bg border border-royal-border text-royal-text rounded-sm focus:outline-none focus:border-royal-gold transition-colors appearance-none" 
                      value={form.category} 
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold tracking-wider text-royal-muted uppercase">Description</label>
                    <textarea 
                      className="w-full p-4 bg-royal-bg border border-royal-border text-royal-text rounded-sm focus:outline-none focus:border-royal-gold transition-colors min-h-[120px] placeholder:text-royal-muted/50" 
                      placeholder="Product details, material, dimensions..." 
                      value={form.desc} 
                      onChange={e => setForm({...form, desc: e.target.value})} 
                    />
                  </div>

                  <div className="md:col-span-2 p-8 border-2 border-dashed border-royal-border rounded-lg bg-royal-bg text-center">
                    <input type="file" multiple hidden id="up" onChange={handleImageUpload} accept="image/*" />
                    <label htmlFor="up" className="cursor-pointer flex flex-col items-center gap-3 text-royal-muted hover:text-royal-gold transition-colors">
                      <Camera size={40} className="text-royal-gold/70" />
                      <span className="text-xs font-bold tracking-widest uppercase">Click to Upload Photos</span>
                    </label>
                    
                    {form.images.length > 0 && (
                      <div className="flex gap-4 mt-6 flex-wrap justify-center">
                        {form.images.map((img, i) => (
                          <div key={i} className="relative group">
                            <img src={img} className="w-24 h-24 object-cover rounded-sm border border-royal-border shadow-sm" alt="Upload preview" />
                            <button 
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              onClick={() => setForm({...form, images: form.images.filter((_, idx) => idx !== i)})}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    className="flex-1 bg-royal-gold text-royal-bg py-4 rounded-sm font-bold text-xs tracking-widest hover:bg-white transition-colors"
                    onClick={saveToInventory}
                  >
                    {isEditing ? "UPDATE ITEM" : "ADD TO CATALOG"}
                  </button>
                  {isEditing && (
                    <button 
                      className="px-8 border border-royal-border text-royal-text rounded-sm font-bold text-xs tracking-widest hover:bg-royal-bg transition-colors"
                      onClick={() => {
                        setIsEditing(null); 
                        setForm({ name: "", category: "Ladies", price: "", desc: "", images: [] });
                      }}
                    >
                      CANCEL
                    </button>
                  )}
                </div>

                <div className="mt-16">
                  <h3 className="font-serif text-2xl text-royal-text mb-6 border-b border-royal-border pb-4">Current Inventory</h3>
                  <div className="space-y-4">
                    {products.length === 0 ? (
                      <p className="text-royal-muted italic">No products in inventory.</p>
                    ) : (
                      products.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-royal-bg border border-royal-border rounded-sm hover:border-royal-gold/50 transition-colors">
                          <div className="flex items-center gap-4">
                            {p.images[0] && <img src={p.images[0]} className="w-12 h-12 object-cover rounded-sm border border-royal-border" alt={p.name} /> }
                            <div>
                              <div className="font-serif text-lg text-royal-text">{p.name}</div>
                              <div className="text-xs font-bold tracking-wider text-royal-gold uppercase">{p.category}</div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              className="p-2 text-royal-muted hover:text-royal-gold bg-royal-surface rounded-full shadow-sm border border-royal-border transition-colors"
                              onClick={() => startEdit(p)}
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="p-2 text-royal-muted hover:text-red-400 bg-royal-surface rounded-full shadow-sm border border-royal-border transition-colors"
                              onClick={() => removeProduct(p.id)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- 3. FOOTER --- */}
      <footer className="bg-royal-surface text-royal-muted py-16 px-6 md:px-12 border-t border-royal-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-serif text-2xl text-royal-text mb-2">COSMO <span className="text-royal-gold italic">Fibers</span></h3>
            <p className="text-sm tracking-widest uppercase">Kerala, India • {DISPLAY_PHONE}</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs tracking-widest uppercase opacity-50 mb-2">© 2026 Premium Showroom Excellence</p>
            <p className="text-xs opacity-30">Designed for elegance and durability.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
