import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { trackMenuEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@shared/order";
import { calculateMenuPrice, getFeaturedProducts } from "@shared/menu";
import { ArrowRight, CakeSlice, ChevronDown, CircleAlert, Clock3, Coffee, MapPin, Minus, Plus, ShoppingBag, Soup, Trash2, Truck, Utensils, X } from "lucide-react";

type Category = { id: string; name: string; icon: "soup" | "utensils" | "cup-soda" | "cake-slice" };
type ProductOption = { id: number; productId: number; name: string; description?: string | null; priceDelta: number | string; available: boolean };
type Product = { id: string; categoryId: string; name: string; description: string; price: number; imageUrl?: string | null; available: boolean; featuredOfDay: boolean; options: ProductOption[] };
type CartLine = Product & { quantity: number; lineId: string; selectedOptions: ProductOption[] };

const defaultCategories: Category[] = [
  { id: "pratos", name: "Pratos caseiros", icon: "soup" },
  { id: "acompanhamentos", name: "Acompanhamentos", icon: "utensils" },
  { id: "bebidas", name: "Bebidas", icon: "cup-soda" },
  { id: "sobremesas", name: "Sobremesas", icon: "cake-slice" },
];

const fallbackProducts: Product[] = [];
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
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff0dc] text-[#e8a33d]"><Soup size={30} /></div>
      <h3 className="font-display text-2xl text-[#8b1e23]">O cardápio está sendo preparado</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#765e54]">As fotos e os preços dos pratos entrarão aqui assim que forem confirmados pela Cantina. Enquanto isso, fale com a gente pelo WhatsApp.</p>
      <a className="breathe mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#e8a33d] px-6 font-extrabold text-[#2b211d]" href={`https://api.whatsapp.com/send?phone=${whatsappNumber}`} target="_blank" rel="noreferrer">Falar no WhatsApp <ArrowRight size={18} /></a>
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
  const [payment, setPayment] = useState<"card_credit" | "card_debit" | "pix">("card_credit");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number[]>>({});
  const menuQuery = trpc.menu.public.useQuery();
  const categories = (menuQuery.data?.categories?.length ? menuQuery.data.categories : defaultCategories).map((category) => ({ ...category, id: String(category.id), icon: (category.icon ?? "utensils") as Category["icon"] }));
  const products = menuQuery.data?.products?.length ? menuQuery.data.products.map((product) => ({ ...product, id: String(product.id), categoryId: String(product.categoryId), price: Number(product.price), available: Boolean(product.available), featuredOfDay: Boolean(product.featuredOfDay), options: (product.options ?? []).map((option) => ({ ...option, priceDelta: Number(option.priceDelta) })) })) : fallbackProducts;
  const isOpen = menuQuery.data?.isOpen ?? true;
  const visibleProducts = useMemo(() => products.filter((item) => item.available && (activeCategory === "todos" || item.categoryId === activeCategory)), [activeCategory, products]);
  const featuredProducts = useMemo(() => getFeaturedProducts(products), [products]);
  useEffect(() => { trackMenuEvent("view_item_list", { category: activeCategory, items: visibleProducts.length }); }, [activeCategory, visibleProducts.length]);
  if (menuQuery.isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#fff8ef] text-[#8b1e23]"><div className="text-center"><img src="https://xuzfsdvzgxaqspheifla.supabase.co/storage/v1/object/public/menu-products/branding/cantina-do-chale-logo.png" alt="" className="mx-auto h-20 w-20 animate-pulse rounded-full" /><p className="mt-4 font-display text-2xl">Preparando o cardápio…</p></div></div>;
  if (menuQuery.isError) return <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8ef] px-5 text-center"><img src="https://xuzfsdvzgxaqspheifla.supabase.co/storage/v1/object/public/menu-products/branding/cantina-do-chale-logo.png" alt="Cantina do Chalé" className="h-20 w-20 rounded-full" /><h1 className="font-display mt-5 text-3xl text-[#8b1e23]">O cardápio não carregou</h1><p className="mt-2 max-w-sm text-[#765e54]">Tente novamente ou fale com a Cantina pelo WhatsApp.</p><button onClick={() => menuQuery.refetch()} className="breathe mt-5 rounded-full bg-[#e8a33d] px-5 py-3 font-extrabold text-[#2b211d]">Tentar novamente</button></div>;
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  function addToCart(product: Product) {
    const chosen = product.options.filter((option) => selectedOptions[product.id]?.includes(option.id));
    const optionTotal = calculateMenuPrice(product, chosen.map((option) => option.id)) - product.price;
    const lineId = `${product.id}:${chosen.map((option) => option.id).sort().join(",")}`;
    trackMenuEvent("add_to_cart", { item_id: product.id, item_name: product.name, value: product.price + optionTotal });
    setCart((current) => {
      const existing = current.find((line) => line.lineId === lineId);
      if (existing) return current.map((line) => line.lineId === lineId ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { ...product, price: product.price + optionTotal, lineId, selectedOptions: chosen, quantity: 1 }];
    });
  }
  function changeQuantity(lineId: string, delta: number) {
    setCart((current) => current.flatMap((line) => line.lineId !== lineId ? [line] : line.quantity + delta <= 0 ? [] : [{ ...line, quantity: line.quantity + delta }]));
  }
  function sendOrder() {
    trackMenuEvent("begin_checkout", { items: cart.length, value: subtotal });
    if (!isOpen || !customerName.trim() || (fulfillment === "delivery" && !address.trim()) || cart.length === 0) return;
    const message = buildWhatsAppUrl({ customerName, fulfillment, payment, address, notes, lines: cart, subtotal }, whatsappNumber);
    window.open(message, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="paper-texture min-h-screen overflow-x-clip pb-24">
      <header className="relative overflow-hidden text-white">
        <img src="https://xuzfsdvzgxaqspheifla.supabase.co/storage/v1/object/public/menu-products/branding/cantina-do-chale-cover.png" alt="Comida caseira servida em panela sobre mesa de madeira" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e100b]/85 via-[#2b211d]/55 to-[#2b211d]/35" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 pb-10 pt-5 sm:px-8 sm:pb-14">
          <nav className="flex items-center justify-between" aria-label="Navegação principal">
            <a href="#inicio" className="inline-flex items-center" aria-label="Cantina do Chalé"><img src="https://xuzfsdvzgxaqspheifla.supabase.co/storage/v1/object/public/menu-products/branding/cantina-do-chale-logo.png" alt="Cantina do Chalé Restaurante" className="h-16 w-16 rounded-full object-cover shadow-[0_8px_24px_rgba(0,0,0,.2)] sm:h-20 sm:w-20" /></a>
            <div className="flex items-center gap-3"><Link href="/admin" className="hidden text-xs font-bold text-white/75 underline-offset-4 hover:text-white hover:underline sm:inline">Área administrativa</Link><div className="flex items-center gap-2 text-sm font-bold"><span className={`h-2.5 w-2.5 rounded-full ${isOpen ? "bg-[#7fe0a4] shadow-[0_0_0_4px_rgba(127,224,164,.16)]" : "bg-[#d4a017] shadow-[0_0_0_4px_rgba(242,184,75,.16)]"}`} />{isOpen ? "Aberto hoje" : "Fechado agora"}</div></div>
          </nav>
          <div id="inicio" className="grid items-end gap-8 pt-16 md:grid-cols-[1.15fr_.85fr] md:pt-24">
            <div>
              <p className="mb-4 text-xs font-extrabold uppercase tracking-[.22em] text-[#d4a017]">Comida caseira em Santo Aleixo</p>
              <h1 className="font-display max-w-2xl text-5xl leading-[.98] sm:text-7xl">Cantina do Chalé</h1><p className="mt-5 font-display text-2xl text-[#d4a017] sm:text-3xl">Aquecendo corações desde 2013</p>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/80">Um cantinho de comida feita com cuidado, do jeitinho que lembra casa. {isOpen ? "Peça para entregar ou passe aqui para retirar." : "Confira o cardápio e fale com a gente para saber o próximo horário."}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <section id="cardapio" className="pt-12 sm:pt-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#e8a33d]">Escolha com calma</p><h2 className="font-display mt-2 text-4xl text-[#8b1e23] sm:text-5xl">Nosso cardápio</h2></div><p className="max-w-xs text-sm leading-6 text-[#765e54]">Pratos para pedir agora, com o carinho da Cantina.</p></div>
          {featuredProducts.length > 0 && <div className="mt-8 rounded-[1.8rem] border border-[#d4a017]/50 bg-[#fff0dc] p-5"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#e8a33d]">Destaque de hoje</p><h3 className="font-display mt-2 text-3xl text-[#8b1e23]">Cardápio do dia</h3><div className="mt-4 flex flex-wrap gap-2">{featuredProducts.map((item) => <button type="button" key={item.id} onClick={() => document.getElementById(`produto-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} className="rounded-full border border-[#e3c9b0] bg-white px-4 py-2 text-sm font-bold text-[#8b1e23]">{item.name} · {money.format(item.price)}</button>)}</div></div>}
          <div className="category-scroller mt-8 flex gap-3 overflow-x-auto pb-2" aria-label="Categorias do cardápio">
            <button onClick={() => setActiveCategory("todos")} className={`breathe flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-extrabold ${activeCategory === "todos" ? "bg-[#8b1e23] text-white" : "border border-[#e3c9b0] bg-white text-[#765e54]"}`}><ShoppingBag size={18} />Tudo</button>
            {categories.map((category) => <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`breathe flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-extrabold ${activeCategory === category.id ? "bg-[#8b1e23] text-white" : "border border-[#e3c9b0] bg-white text-[#765e54]"}`}><span className="text-[#e8a33d]"><CategoryIcon icon={category.icon} /></span>{category.name}</button>)}
          </div>
          <div className="mt-7">{visibleProducts.length === 0 ? <EmptyMenu /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map((product) => <article id={`produto-${product.id}`} key={product.id} className="overflow-hidden rounded-[1.6rem] border border-[#ead5c1] bg-white shadow-[0_14px_40px_rgba(139,30,35,.07)]"><div className="aspect-[4/3] bg-[#f5ddc5]">{product.imageUrl && <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover" />}</div><div className="p-5">{product.featuredOfDay && <span className="inline-flex rounded-full bg-[#fff0dc] px-3 py-1 text-xs font-extrabold text-[#8b1e23]">Cardápio do dia</span>}<h3 className="font-display mt-2 text-2xl text-[#8b1e23]">{product.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#765e54]">{product.description}</p>{product.options.length > 0 && <div className="mt-4 space-y-2 rounded-2xl bg-[#fff8ef] p-3"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e8a33d]">Escolha seus complementos</p>{product.options.map((option) => <label key={option.id} className="flex items-center gap-2 text-sm text-[#765e54]"><input type="checkbox" checked={selectedOptions[product.id]?.includes(option.id) ?? false} onChange={(event) => setSelectedOptions((current) => ({ ...current, [product.id]: event.target.checked ? [...(current[product.id] ?? []), option.id] : (current[product.id] ?? []).filter((id) => id !== option.id) }))} /><span className="flex-1">{option.name}</span><span className="font-bold">+ {money.format(Number(option.priceDelta))}</span></label>)}</div>}<div className="mt-5 flex items-center justify-between gap-3"><strong className="text-lg text-[#8b1e23]">{money.format(calculateMenuPrice(product, selectedOptions[product.id] ?? []))}</strong><button type="button" onClick={() => addToCart(product)} className="breathe inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e8a33d] px-4 text-sm font-extrabold text-[#2b211d]">Adicionar <Plus size={17} /></button></div></div></article>)}</div>}</div>
        </section>
        <section id="onde-estamos" className="mt-16 grid gap-5 pb-14 lg:grid-cols-[.85fr_1.15fr]"><div className="rounded-[1.8rem] bg-[#8b1e23] p-7 text-white"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#d4a017]">Onde estamos</p><h2 className="font-display mt-3 text-2xl leading-tight sm:text-3xl">Rua Malvino Ferreira de Andrade, 689 — Santo Aleixo, Magé — RJ</h2><p className="mt-3 text-sm leading-6 text-white/75">Venha buscar seu pedido ou fale com a gente para combinar a entrega.</p><div className="mt-5 flex items-center gap-2 text-sm font-bold"><MapPin size={18} className="text-[#d4a017]" />Cantina do Chalé</div></div><div className="rounded-[1.8rem] border border-[#ead5c1] bg-white p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#e8a33d]">Atendimento</p><h2 className="font-display mt-3 text-3xl text-[#8b1e23]">Do nosso jeito</h2></div><div className="flex items-center gap-2 rounded-full bg-[#fff0dc] px-3 py-2 text-xs font-extrabold text-[#8b1e23]"><Truck size={16} className="text-[#e8a33d]" />Área de entrega</div></div><div className="mt-5 grid gap-4 text-sm text-[#765e54] sm:grid-cols-[.7fr_1.3fr]"><div className="space-y-3"><div className="flex items-center gap-3"><Clock3 size={18} className="text-[#e8a33d]" />Consulte o horário pelo WhatsApp</div><div className="flex items-center gap-3"><ShoppingBag size={18} className="text-[#e8a33d]" />Entrega ou retirada na loja</div></div><div className="rounded-2xl bg-[#fff8ef] p-4"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e8a33d]">Atendemos nestas áreas</p><div className="mt-3 flex flex-wrap gap-2">{["Batatal", "Cavado", "Ponte Ezequiel", "Andorinhas", "Poço Escuro", "Paineira", "Centro", "Chalé", "Picos 1 e 2", "Santo Aleixo", "Cascata", "Gandé", "BNH", "Cachoeirinha"].map((area) => <span key={area} className="rounded-full border border-[#ead5c1] bg-white px-3 py-1.5 text-xs font-bold text-[#8b1e23]">{area}</span>)}</div><p className="mt-3 text-xs font-bold text-[#8b1e23]">Consulte a taxa de entrega pelo WhatsApp.</p></div></div></div></section>
      </main>

      <footer className="border-t border-[#ead5c1] bg-[#fff8ef] px-5 py-5"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-xs text-[#765e54]"><span>© Cantina do Chalé · Rua Malvino Ferreira de Andrade, 689 — Santo Aleixo, Magé — RJ</span><Link href="/admin" className="font-bold text-[#8b1e23] underline-offset-4 hover:underline">Área administrativa</Link></div></footer>

      {itemCount > 0 && <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-[#8b1e23]/10 bg-white/95 p-3 shadow-[0_-10px_30px_rgba(43,33,29,.12)] backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-2"><button onClick={() => setCartOpen(true)} className="flex min-h-12 items-center gap-3 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b1e23] text-white"><ShoppingBag size={19} /></span><span><span className="block text-xs font-bold text-[#765e54]" aria-live="polite">{itemCount} {itemCount === 1 ? "item" : "itens"}</span><strong className="text-[#8b1e23]">{money.format(subtotal)}</strong></span></button><button onClick={() => setCartOpen(true)} className="breathe min-h-12 rounded-full bg-[#e8a33d] px-5 font-extrabold text-[#2b211d]">Ver pedido</button></div></div>}

      {(cartOpen || checkoutOpen) && <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#2b211d]/50 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true"><div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-[#fff8ef] p-5 sm:rounded-[2rem] sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#e8a33d]">{checkoutOpen ? "Quase lá" : "Seu pedido"}</p><h2 className="font-display mt-1 text-3xl text-[#8b1e23]">{checkoutOpen ? "Enviar pelo WhatsApp" : "Carrinho"}</h2></div><button onClick={() => { setCartOpen(false); setCheckoutOpen(false); }} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead5c1] bg-white" aria-label="Fechar"><X size={20} /></button></div>
          {!checkoutOpen ? <><div className="mt-6 space-y-3">{cart.map((line) => <div key={line.lineId} className="flex items-center gap-3 rounded-2xl border border-[#ead5c1] bg-white p-3"><div className="h-14 w-14 overflow-hidden rounded-xl bg-[#f5ddc5]"><img src={line.imageUrl || "https://xuzfsdvzgxaqspheifla.supabase.co/storage/v1/object/public/menu-products/branding/cantina-do-chale-logo.png"} alt={line.name} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = "https://xuzfsdvzgxaqspheifla.supabase.co/storage/v1/object/public/menu-products/branding/cantina-do-chale-logo.png"; }} /></div><div className="min-w-0 flex-1"><p className="truncate font-extrabold text-[#8b1e23]">{line.name}</p><p className="text-sm text-[#765e54]">{money.format(line.price)}{line.selectedOptions.length > 0 ? ` · ${line.selectedOptions.map((option) => option.name).join(", ")}` : ""}</p></div><div className="flex items-center gap-2"><button onClick={() => changeQuantity(line.lineId, -1)} className="h-9 w-9 rounded-full border border-[#ead5c1] bg-[#fff8ef]" aria-label="Diminuir quantidade"><Minus size={15} className="mx-auto" /></button><span className="w-4 text-center font-bold">{line.quantity}</span><button onClick={() => changeQuantity(line.lineId, 1)} className="h-9 w-9 rounded-full bg-[#e8a33d]" aria-label="Aumentar quantidade"><Plus size={15} className="mx-auto" /></button></div><button onClick={() => setCart((current) => current.filter((item) => item.lineId !== line.lineId))} className="text-[#a83232]" aria-label={`Remover ${line.name}`}><Trash2 size={17} /></button></div>)}</div><div className="mt-6 flex items-center justify-between border-t border-[#ead5c1] pt-4"><span className="font-bold text-[#765e54]">Subtotal</span><strong className="text-xl text-[#8b1e23]">{money.format(subtotal)}</strong></div><button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} className="breathe mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#e8a33d] font-extrabold text-[#2b211d]">Continuar pedido <ArrowRight size={18} /></button></> : <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); sendOrder(); }}><label className="block text-sm font-extrabold text-[#2b211d]">Seu nome<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="mt-2 min-h-12 w-full rounded-2xl border border-[#ead5c1] bg-white px-4 outline-none focus:border-[#e8a33d]" placeholder="Como podemos te chamar?" /></label><fieldset><legend className="text-sm font-extrabold text-[#2b211d]">Como prefere receber?</legend><div className="mt-2 grid grid-cols-2 gap-3"><button type="button" onClick={() => setFulfillment("delivery")} className={`min-h-12 rounded-2xl border text-sm font-bold ${fulfillment === "delivery" ? "border-[#e8a33d] bg-[#fff0dc] text-[#8b1e23]" : "border-[#ead5c1] bg-white text-[#765e54]"}`}><Truck size={17} className="mx-auto mb-1" />Entrega</button><button type="button" onClick={() => setFulfillment("pickup")} className={`min-h-12 rounded-2xl border text-sm font-bold ${fulfillment === "pickup" ? "border-[#e8a33d] bg-[#fff0dc] text-[#8b1e23]" : "border-[#ead5c1] bg-white text-[#765e54]"}`}><ShoppingBag size={17} className="mx-auto mb-1" />Retirada</button></div></fieldset><fieldset><legend className="text-sm font-extrabold text-[#2b211d]">Como prefere pagar?</legend><div className="mt-2 grid gap-3 sm:grid-cols-3"><button type="button" onClick={() => setPayment("card_credit")} className={`min-h-12 rounded-2xl border text-sm font-bold ${payment === "card_credit" ? "border-[#e8a33d] bg-[#fff0dc] text-[#8b1e23]" : "border-[#ead5c1] bg-white text-[#765e54]"}`}>Cartão de crédito</button><button type="button" onClick={() => setPayment("card_debit")} className={`min-h-12 rounded-2xl border text-sm font-bold ${payment === "card_debit" ? "border-[#e8a33d] bg-[#fff0dc] text-[#8b1e23]" : "border-[#ead5c1] bg-white text-[#765e54]"}`}>Cartão de débito</button><button type="button" onClick={() => setPayment("pix")} className={`min-h-12 rounded-2xl border text-sm font-bold ${payment === "pix" ? "border-[#e8a33d] bg-[#fff0dc] text-[#8b1e23]" : "border-[#ead5c1] bg-white text-[#765e54]"}`}>Pix via WhatsApp</button></div>{payment === "pix" && <p className="mt-3 rounded-2xl bg-[#fff0dc] px-4 py-3 text-sm leading-6 text-[#765e54]">A Cantina enviará a chave Pix pelo WhatsApp após receber as especificações do pedido.</p>}</fieldset>{fulfillment === "delivery" && <label className="block text-sm font-extrabold text-[#2b211d]">Endereço de entrega<textarea required value={address} onChange={(event) => setAddress(event.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-[#ead5c1] bg-white px-4 py-3 outline-none focus:border-[#e8a33d]" placeholder="Rua, número, bairro e referência" /></label>}<label className="block text-sm font-extrabold text-[#2b211d]">Observações <span className="font-normal text-[#765e54]">(opcional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-20 w-full rounded-2xl border border-[#ead5c1] bg-white px-4 py-3 outline-none focus:border-[#e8a33d]" placeholder="Algum recado para a Cantina?" /></label><div className={`rounded-2xl p-4 text-sm ${isOpen ? "bg-[#8b1e23] text-white" : "border border-[#d4a017]/60 bg-[#fff0dc] text-[#8b1e23]"}`}><div className="flex items-center gap-2 font-bold"><CircleAlert size={17} className="text-[#d4a017]" />{isOpen ? "Você será levado ao WhatsApp para enviar o pedido." : "A loja está fechada no momento. Você pode montar o carrinho, mas o envio será liberado quando a Cantina abrir."}</div></div><button type="submit" disabled={!isOpen} className="breathe flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#e8a33d] font-extrabold text-[#2b211d] disabled:cursor-not-allowed disabled:opacity-50">{isOpen ? "Enviar pedido no WhatsApp" : "Envio indisponível enquanto fechado"} {isOpen && <ArrowRight size={18} />}</button></form>}
        </div></div>}
    </div>
  );
}
