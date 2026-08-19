import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Save, Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type ProductOption = { id: number; productId: number; name: string; description?: string | null; priceDelta: string | number; available: boolean };
type OptionDraft = { name: string; description: string; priceDelta: string; available: boolean };

const emptyOption: OptionDraft = { name: "", description: "", priceDelta: "0.00", available: true };

export function ProductOptionsEditor({ productId, options }: { productId: number; options: ProductOption[] }) {
  const [items, setItems] = useState<ProductOption[]>(options);
  const [draft, setDraft] = useState<OptionDraft>(emptyOption);
  const [editingId, setEditingId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const create = trpc.menu.products.options.create.useMutation({ onSuccess: () => { utils.menu.admin.invalidate(); setDraft(emptyOption); } });
  const update = trpc.menu.products.options.update.useMutation({ onSuccess: () => { utils.menu.admin.invalidate(); setEditingId(null); setDraft(emptyOption); } });
  const remove = trpc.menu.products.options.remove.useMutation({ onSuccess: () => utils.menu.admin.invalidate() });
  const reorder = trpc.menu.products.options.reorder.useMutation({ onSuccess: () => utils.menu.admin.invalidate() });

  useEffect(() => setItems(options), [options]);

  function save() {
    if (!draft.name.trim() || !/^\d+(\.\d{1,2})?$/.test(draft.priceDelta)) return;
    const input = { productId, name: draft.name.trim(), description: draft.description.trim() || null, priceDelta: draft.priceDelta, available: draft.available };
    if (editingId) update.mutate({ ...input, id: editingId });
    else create.mutate(input);
  }

  function edit(option: ProductOption) {
    setEditingId(option.id);
    setDraft({ name: option.name, description: option.description ?? "", priceDelta: String(option.priceDelta), available: option.available });
  }

  return <section className="mt-6 rounded-2xl border border-[#ead5c1] bg-white/70 p-4">
    <div className="flex items-center justify-between gap-3"><div><h3 className="font-extrabold text-[#8b1e23]">Opções e complementos</h3><p className="mt-1 text-xs leading-5 text-[#765e54]">Ex.: tamanho, proteína, molho, acompanhamento ou adicional.</p></div><span className="rounded-full bg-[#fff0dc] px-3 py-1 text-xs font-bold text-[#8b1e23]">{items.length}</span></div>
    <div className="mt-4 space-y-2">{items.map((option) => <div key={option.id} className="flex items-center gap-2 rounded-xl border border-[#ead5c1] bg-white p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-[#8b1e23]">{option.name}</p><p className="text-xs text-[#765e54]">+ R$ {Number(option.priceDelta).toFixed(2).replace(".", ",")} · {option.available ? "Disponível" : "Indisponível"}</p></div><button type="button" onClick={() => reorder.mutate({ id: option.id, direction: "up" })} className="rounded-lg p-2 text-[#8b1e23]" aria-label={`Subir ${option.name}`}><ArrowUp size={14} /></button><button type="button" onClick={() => reorder.mutate({ id: option.id, direction: "down" })} className="rounded-lg p-2 text-[#8b1e23]" aria-label={`Descer ${option.name}`}><ArrowDown size={14} /></button><button type="button" onClick={() => update.mutate({ id: option.id, productId, name: option.name, description: option.description ?? null, priceDelta: String(option.priceDelta), available: !option.available })} className="rounded-lg px-2 py-2 text-xs font-bold text-[#8b1e23]">{option.available ? "Desativar" : "Ativar"}</button><button type="button" onClick={() => edit(option)} className="rounded-lg p-2 text-[#8b1e23]" aria-label={`Editar opção ${option.name}`}><Pencil size={15} /></button><button type="button" onClick={() => remove.mutate({ id: option.id })} className="rounded-lg p-2 text-[#a83232]" aria-label={`Remover opção ${option.name}`}><Trash2 size={15} /></button></div>)}</div>
    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_110px] sm:items-end"><label className="text-xs font-bold text-[#765e54]">Nome<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1 min-h-10 w-full rounded-xl border border-[#ead5c1] bg-white px-3 text-sm" placeholder="Ex.: Frango grelhado" /></label><label className="text-xs font-bold text-[#765e54]">Descrição<input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="mt-1 min-h-10 w-full rounded-xl border border-[#ead5c1] bg-white px-3 text-sm" placeholder="Detalhes opcionais" /></label><label className="text-xs font-bold text-[#765e54]">Adicional<input value={draft.priceDelta} onChange={(e) => setDraft({ ...draft, priceDelta: e.target.value })} inputMode="decimal" className="mt-1 min-h-10 w-full rounded-xl border border-[#ead5c1] bg-white px-3 text-sm" placeholder="0.00" /></label></div>
    <div className="mt-3 flex flex-wrap items-center gap-3"><label className="flex items-center gap-2 text-xs font-bold text-[#765e54]"><input type="checkbox" checked={draft.available} onChange={(e) => setDraft({ ...draft, available: e.target.checked })} /> Disponível</label><button type="button" onClick={save} className="breathe inline-flex min-h-10 items-center gap-2 rounded-full bg-[#ff6b35] px-4 text-xs font-extrabold"><Save size={15} /> {editingId ? "Salvar opção" : "Adicionar opção"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyOption); }} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#ead5c1] px-4 text-xs font-bold text-[#8b1e23]"><X size={15} /> Cancelar</button>}</div>
  </section>;
}
