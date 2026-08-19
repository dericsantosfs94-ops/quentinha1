import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CakeSlice, ChevronDown, CircleAlert, Clock3, Coffee, MapPin, Minus, Plus, ShoppingBag, Soup, Trash2, Truck, Utensils, X } from "lucide-react";

type Category = { id: string; name: string; icon: "soup" | "utensils" | "cup-soda" | "cake-slice" };
type Product = { id: string; categoryId: string; name: string; description: string; price: number; imageUrl?: string; available: boolean };
type CartLine = Product & { quantity: number };

const categories: Category[] = [
  { id: "pratos", name: "Pratos caseiros", icon: "soup" },
  { id: "acompanhamentos", name: "Acompanhamentos", icon: "utensils" },
  { id: "bebidas", name: "Bebidas", icon: "cup-soda" },
  { id: "sobremesas", name: "Sobremesas", icon: "cake-slice" },
];

const products: Product[] = [];
const whatsappNumber = "5521988678298";
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function CategoryIcon({ icon }: { icon: Category["icon"] }) {
  const props = { size: 22, strokeWidth: 1.7 };
  if (icon === "soup") return <Soup {...props} />;
  if (icon === "utensils") return <Utensils {...props} />;
  if (icon === "cup-soda") return <Coffee {...props} />;
  return <CakeSlice {...props} />;
}

function EmptyMenu() {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#d8b99d] bg-white/70 px-6 py-14 text-center shadow-[0_16px_50px_rgba(139,30,35,0.06)]">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff0dc] text-[#ff6b35]"><Soup size={30} /></div>
      <h3 className="font-display text-2xl text-[#8b1e23]">O cardápio está sendo preparado</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#765e54]">As fotos e os preços dos pratos entrarão aqui assim que forem confirmados pela Cantina. Enquanto isso, fale com a gente pelo WhatsApp.</p>
      <a className="breathe mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff6b35] px-6 font-extrabold text-[#2b211d]" href={`https://api.whatsapp.com/send?phone=${whatsappNumber}`} target="_blank" rel="noreferrer">Falar no WhatsApp <ArrowRight size={18} /></a>
    </div>
  );
}

export default function Home() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const visibleProducts = useMemo(() => products.filter((item) => item.available && (activeCategory === "todos" || item.categoryId === activeCategory)), [activeCategory]);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((line) => line.id === product.id);
      if (existing) return current.map((line) => line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { ...product, quantity: 1 }];
    });
  }
  function changeQuantity(id: string, delta: number) {
    setCart((current) => current.flatMap((line) => line.id !== id ? [line] : line.quantity + delta <= 0 ? [] : [{ ...line, quantity: line.quantity + delta }]));
  }
  function sendOrder() {
    if (!customerName.trim() || (fulfillment === "delivery" && !address.trim()) || cart.length === 0) return;
    const lines = cart.map((line) => `• ${line.quantity}x ${line.name} — ${money.format(line.price * line.quantity)}`).join("%0A");
    const destination = fulfillment === "delivery" ? `Entrega: ${address.trim()}` : "Retirada na loja";
    const message = `Olá, Cantina do Chalé!%0A%0AGostaria de fazer um pedido.%0A%0ANome: ${customerName.trim()}%0A${destination}%0A%0A${lines}%0A%0ASubtotal: ${money.format(subtotal)}${notes.trim() ? `%0AObservações: ${notes.trim()}` : ""}`;
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="paper-texture min-h-screen pb-24">
      <header className="hero-mesh text-white">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-5 sm:px-8 sm:pb-14">
          <nav className="flex items-center justify-between" aria-label="Navegação principal">
            <a href="#inicio" className="inline-flex items-center" aria-label="Cantina do Chalé"><img src="/manus-storage/logo_d54b5be6.png" alt="Cantina do Chalé Restaurante" className="h-16 w-16 rounded-full object-cover shadow-[0_8px_24px_rgba(0,0,0,.2)] sm:h-20 sm:w-20" /></a>
            <div className="flex items-center gap-2 text-sm font-bold"><span className="h-2.5 w-2.5 rounded-full bg-[#7fe0a4] shadow-[0_0_0_4px_rgba(127,224,164,.16)]" />Aberto hoje</div>
          </nav>
          <div id="inicio" className="grid items-end gap-8 pt-16 md:grid-cols-[1.15fr_.85fr] md:pt-24">
            <div>
              <p className="mb-4 text-xs font-extrabold uppercase tracking-[.22em] text-[#f2b84b]">Comida caseira em Santo Aleixo</p>
              <h1 className="font-display max-w-2xl text-5xl leading-[.98] sm:text-7xl">Aquecendo corações desde 2013.</h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/80">Um cantinho de comida feita com cuidado, do jeitinho que lembra casa. Peça para entregar ou passe aqui para retirar.</p>
              <div className="mt-8 flex flex-wrap gap-3"><a href="#cardapio" className="breathe inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff6b35] px-6 font-extrabold text-[#2b211d]">Ver cardápio <ArrowRight size={18} /></a><a href="#onde-estamos" className="breathe inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-5 font-bold text-white">Santo Aleixo/Magé-RJ</a></div>
            </div>
            <div className="relative hidden min-h-[260px] overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/10 p-6 backdrop-blur-sm md:block">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#f2b84b]/30 blur-2xl" />
              <div className="relative flex h-full flex-col justify-between"><div className="flex items-center gap-3 text-[#f2b84b]"><Soup size={28} /><span className="text-sm font-extrabold uppercase tracking-[.18em]">Feito no capricho</span></div><p className="max-w-xs font-display text-3xl leading-tight">“Tempero de casa, conversa boa e comida que abraça.”</p><div className="flex items-center gap-2 text-sm text-white/70"><MapPin size={16} />Santo Aleixo, Magé — RJ</div></div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <section id="cardapio" className="pt-12 sm:pt-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ff6b35]">Escolha com calma</p><h2 className="font-display mt-2 text-4xl text-[#8b1e23] sm:text-5xl">Nosso cardápio</h2></div><p className="max-w-xs text-sm leading-6 text-[#765e54]">Pratos para pedir agora, com o carinho da Cantina.</p></div>
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2" aria-label="Categorias do cardápio">
            <button onClick={() => setActiveCategory("todos")} className={`breathe flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-extrabold ${activeCategory === "todos" ? "bg-[#8b1e23] text-white" : "border border-[#e3c9b0] bg-white text-[#765e54]"}`}><ShoppingBag size={18} />Tudo</button>
            {categories.map((category) => <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`breathe flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-extrabold ${activeCategory === category.id ? "bg-[#8b1e23] text-white" : "border border-[#e3c9b0] bg-white text-[#765e54]"}`}><span className="text-[#ff6b35]"><CategoryIcon icon={category.icon} /></span>{category.name}</button>)}
          </div>
          <div className="mt-7">{visibleProducts.length === 0 ? <EmptyMenu /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map((product) => <article key={product.id} className="overflow-hidden rounded-[1.6rem] border border-[#ead5c1] bg-white shadow-[0_14px_40px_rgba(139,30,35,.07)]"><div className="aspect-[4/3] bg-[#f5ddc5]">{product.imageUrl && <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover" />}</div><div className="p-5"><h3 className="font-display text-2xl text-[#8b1e23]">{product.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#765e54]">{product.description}</p><div className="mt-5 flex items-center justify-between gap-3"><strong className="text-lg text-[#8b1e23]">{money.format(product.price)}</strong><button onClick={() => addToCart(product)} className="breathe inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ff6b35] px-4 text-sm font-extrabold text-[#2b211d]">Adicionar <Plus size={17} /></button></div></div></article>)}</div>}</div>
        </section>
        <section id="onde-estamos" className="mt-16 grid gap-5 pb-14 sm:grid-cols-2"><div className="rounded-[1.8rem] bg-[#8b1e23] p-7 text-white"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#f2b84b]">Onde estamos</p><h2 className="font-display mt-3 text-3xl">Santo Aleixo/Magé-RJ</h2><p className="mt-3 text-sm leading-6 text-white/75">Venha buscar seu pedido ou fale com a gente para combinar a entrega.</p><div className="mt-5 flex items-center gap-2 text-sm font-bold"><MapPin size={18} className="text-[#f2b84b]" />Cantina do Chalé</div></div><div className="rounded-[1.8rem] border border-[#ead5c1] bg-white p-7"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ff6b35]">Atendimento</p><h2 className="font-display mt-3 text-3xl text-[#8b1e23]">Do nosso jeito</h2><div className="mt-5 space-y-3 text-sm text-[#765e54]"><div className="flex items-center gap-3"><Clock3 size={18} className="text-[#ff6b35]" />Consulte o horário pelo WhatsApp</div><div className="flex items-center gap-3"><Truck size={18} className="text-[#ff6b35]" />Entrega ou retirada na loja</div></div></div></section>
      </main>

      {itemCount > 0 && <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#8b1e23]/10 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(43,33,29,.12)] backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-2"><button onClick={() => setCartOpen(true)} className="flex min-h-12 items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b1e23] text-white"><ShoppingBag size={19} /></span><span><span className="block text-xs font-bold text-[#765e54]" aria-live="polite">{itemCount} {itemCount === 1 ? "item" : "itens"}</span><strong className="text-[#8b1e23]">{money.format(subtotal)}</strong></span></button><button onClick={() => setCartOpen(true)} className="breathe min-h-12 rounded-full bg-[#ff6b35] px-5 font-extrabold text-[#2b211d]">Ver pedido</button></div></div>}

      {(cartOpen || checkoutOpen) && <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#2b211d]/50 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true"><div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-[#fff8ef] p-5 sm:rounded-[2rem] sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ff6b35]">{checkoutOpen ? "Quase lá" : "Seu pedido"}</p><h2 className="font-display mt-1 text-3xl text-[#8b1e23]">{checkoutOpen ? "Enviar pelo WhatsApp" : "Carrinho"}</h2></div><button onClick={() => { setCartOpen(false); setCheckoutOpen(false); }} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead5c1] bg-white" aria-label="Fechar"><X size={20} /></button></div>
          {!checkoutOpen ? <><div className="mt-6 space-y-3">{cart.map((line) => <div key={line.id} className="flex items-center gap-3 rounded-2xl border border-[#ead5c1] bg-white p-3"><div className="h-14 w-14 rounded-xl bg-[#f5ddc5]" /><div className="min-w-0 flex-1"><p className="truncate font-extrabold text-[#8b1e23]">{line.name}</p><p className="text-sm text-[#765e54]">{money.format(line.price)}</p></div><div className="flex items-center gap-2"><button onClick={() => changeQuantity(line.id, -1)} className="h-9 w-9 rounded-full border border-[#ead5c1] bg-[#fff8ef]" aria-label="Diminuir quantidade"><Minus size={15} className="mx-auto" /></button><span className="w-4 text-center font-bold">{line.quantity}</span><button onClick={() => changeQuantity(line.id, 1)} className="h-9 w-9 rounded-full bg-[#ff6b35]" aria-label="Aumentar quantidade"><Plus size={15} className="mx-auto" /></button></div><button onClick={() => setCart((current) => current.filter((item) => item.id !== line.id))} className="text-[#a83232]" aria-label={`Remover ${line.name}`}><Trash2 size={17} /></button></div>)}</div><div className="mt-6 flex items-center justify-between border-t border-[#ead5c1] pt-4"><span className="font-bold text-[#765e54]">Subtotal</span><strong className="text-xl text-[#8b1e23]">{money.format(subtotal)}</strong></div><button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} className="breathe mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#ff6b35] font-extrabold text-[#2b211d]">Continuar pedido <ArrowRight size={18} /></button></> : <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); sendOrder(); }}><label className="block text-sm font-extrabold text-[#2b211d]">Seu nome<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-[#ead5c1] bg-white px-4 outline-none focus:border-[#ff6b35]" placeholder="Como podemos te chamar?" /></label><fieldset><legend className="text-sm font-extrabold text-[#2b211d]">Como prefere receber?</legend><div className="mt-2 grid grid-cols-2 gap-3"><button type="button" onClick={() => setFulfillment("delivery")} className={`min-h-12 rounded-2xl border text-sm font-bold ${fulfillment === "delivery" ? "border-[#ff6b35] bg-[#fff0dc] text-[#8b1e23]" : "border-[#ead5c1] bg-white text-[#765e54]"}`}><Truck size={17} className="mx-auto mb-1" />Entrega</button><button type="button" onClick={() => setFulfillment("pickup")} className={`min-h-12 rounded-2xl border text-sm font-bold ${fulfillment === "pickup" ? "border-[#ff6b35] bg-[#fff0dc] text-[#8b1e23]" : "border-[#ead5c1] bg-white text-[#765e54]"}`}><ShoppingBag size={17} className="mx-auto mb-1" />Retirada</button></div></fieldset>{fulfillment === "delivery" && <label className="block text-sm font-extrabold text-[#2b211d]">Endereço de entrega<textarea required value={address} onChange={(event) => setAddress(event.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-[#ead5c1] bg-white px-4 py-3 outline-none focus:border-[#ff6b35]" placeholder="Rua, número, bairro e referência" /></label>}<label className="block text-sm font-extrabold text-[#2b211d]">Observações <span className="font-normal text-[#765e54]">(opcional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-20 w-full rounded-2xl border border-[#ead5c1] bg-white px-4 py-3 outline-none focus:border-[#ff6b35]" placeholder="Algum recado para a Cantina?" /></label><div className="rounded-2xl bg-[#8b1e23] p-4 text-sm text-white"><div className="flex items-center gap-2 font-bold"><CircleAlert size={17} className="text-[#f2b84b]" />Você será levado ao WhatsApp para enviar o pedido.</div></div><button type="submit" className="breathe flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#ff6b35] font-extrabold text-[#2b211d]">Enviar pedido no WhatsApp <ArrowRight size={18} /></button></form>}
        </div></div>}
    </div>
  );
}
