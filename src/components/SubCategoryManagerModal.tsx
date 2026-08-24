import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { SubCategoryItem, MainCategory } from '../types/bos';

interface SubCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subCategories: SubCategoryItem[];
  onAddSubCategory: (newItem: Omit<SubCategoryItem, 'id'>) => void;
  onEditSubCategory: (id: string, updatedItem: Omit<SubCategoryItem, 'id'>) => void;
  onDeleteSubCategory: (id: string) => void;
}

const MAIN_CATEGORY_LABELS: Record<MainCategory, { title: string; badge: string; color: string }> = {
  HONOR: {
    title: 'A. Belanja Honorarium (Max 60% Plafon)',
    badge: 'HONOR',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  KEGIATAN_RUTIN: {
    title: 'B. Belanja Operasional & Kegiatan Rutin',
    badge: 'RUTIN',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
  },
  KEGIATAN_NON_RUTIN: {
    title: 'C. Belanja Non-Rutin & Pengembangan',
    badge: 'NON-RUTIN',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  KHUSUS: {
    title: 'D. Program Khusus, MBG & Adm Bank',
    badge: 'KHUSUS',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
};

export const SubCategoryManagerModal: React.FC<SubCategoryManagerModalProps> = ({
  isOpen,
  onClose,
  subCategories,
  onAddSubCategory,
  onEditSubCategory,
  onDeleteSubCategory,
}) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [mainCategory, setMainCategory] = useState<MainCategory>('KEGIATAN_RUTIN');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setCode(`C${subCategories.length + 1}`);
    setName('');
    setMainCategory('KEGIATAN_RUTIN');
    setDescription('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: SubCategoryItem) => {
    setEditingId(item.id);
    setCode(item.code);
    setName(item.name);
    setMainCategory(item.mainCategory);
    setDescription(item.description || '');
    setShowFormModal(true);
  };

  const handleSaveSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onEditSubCategory(editingId, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        mainCategory,
        description: description.trim(),
      });
    } else {
      onAddSubCategory({
        code: code.trim().toUpperCase() || 'CUSTOM',
        name: name.trim(),
        mainCategory,
        description: description.trim(),
      });
    }
    setShowFormModal(false);
  };

  // Group subcategories by mainCategory
  const mainCats: MainCategory[] = ['HONOR', 'KEGIATAN_RUTIN', 'KEGIATAN_NON_RUTIN', 'KHUSUS'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-[#D1E5E5] overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#083838] text-white p-5 flex items-center justify-between shrink-0 border-b border-[#0F766E]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-[#2DD4BF] border border-[#2DD4BF]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">
                Kelola Komponen Sub-Kategori Juknis BOS 2026
              </h2>
              <p className="text-xs text-[#CCFBF1]">
                Tambah, ubah nama, atau hapus komponen sub-kategori belanja untuk penyesuaian RKAM & BKU
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#CCFBF1] hover:bg-[#0F766E] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 bg-[#F2F8F8] border-b border-[#D1E5E5] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#526E6E] font-medium">
            Total Komponen Terdaftar: <strong className="text-[#0F2D2D] font-black">{subCategories.length} Item</strong>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Sub-Kategori Manual</span>
          </button>
        </div>

        {/* Subcategories List grouped by Main Category */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {mainCats.map((catKey) => {
            const catInfo = MAIN_CATEGORY_LABELS[catKey];
            const itemsInCat = subCategories.filter((item) => item.mainCategory === catKey);

            return (
              <div key={catKey} className="bg-white rounded-xl border border-[#D1E5E5] overflow-hidden shadow-sm">
                <div className="bg-[#E2EEEE] px-4 py-3 flex items-center justify-between border-b border-[#D1E5E5]">
                  <span className="text-xs font-black text-[#0F2D2D] uppercase tracking-wider">
                    {catInfo.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${catInfo.color}`}>
                    {itemsInCat.length} Komponen
                  </span>
                </div>

                <div className="divide-y divide-[#E2EEEE]">
                  {itemsInCat.length === 0 ? (
                    <div className="p-4 text-xs text-center text-[#526E6E]">
                      Belum ada sub-kategori dalam kelompok ini.
                    </div>
                  ) : (
                    itemsInCat.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 hover:bg-[#F2F8F8] transition flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-[#0D9488] text-white text-[10px] font-extrabold font-mono">
                              {item.code}
                            </span>
                            <span className="text-xs font-bold text-[#0F2D2D]">{item.name}</span>
                            {item.isDefault && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                Bawaan Juknis
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-[#526E6E] pl-0.5">{item.description}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Sub-Kategori"
                            className="p-1.5 rounded-lg text-[#0D9488] hover:bg-[#CCFBF1] transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteSubCategory(item.id)}
                            title="Hapus Sub-Kategori"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F2F8F8] border-t border-[#D1E5E5] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0D9488] text-white font-bold text-xs hover:bg-[#0F766E] shadow-sm transition"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Nested Add / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D1E5E5] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2EEEE] pb-3">
              <h3 className="text-base font-black text-[#0F2D2D] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#0D9488]" />
                {editingId ? 'Edit Komponen Sub-Kategori' : 'Tambah Sub-Kategori Baru'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">
                  Kategori Utama Juknis
                </label>
                <select
                  value={mainCategory}
                  onChange={(e) => setMainCategory(e.target.value as MainCategory)}
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-xl focus:ring-2 focus:ring-[#0D9488] bg-[#F2F8F8] text-[#0F2D2D] font-semibold"
                >
                  <option value="HONOR">A. Belanja Honorarium (Max 60% Plafon)</option>
                  <option value="KEGIATAN_RUTIN">B. Belanja Operasional & Kegiatan Rutin</option>
                  <option value="KEGIATAN_NON_RUTIN">C. Belanja Non-Rutin & Pengembangan</option>
                  <option value="KHUSUS">D. Program Khusus, MBG & Adm Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-bold text-[#0F2D2D] mb-1">Kode / Prefix</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="Contoh: B5"
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-xl focus:ring-2 focus:ring-[#0D9488] font-mono text-xs uppercase bg-[#F2F8F8] text-[#0F2D2D]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-[#0F2D2D] mb-1">Nama Sub-Kategori</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nama komponen sub-kategori"
                    className="w-full px-3 py-2 border border-[#D1E5E5] rounded-xl focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0F2D2D] mb-1">
                  Keterangan / Scope Penggunaan (Opsional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Deskripsi singkat jenis pengeluaran yang diizinkan untuk sub-kategori ini..."
                  className="w-full px-3 py-2 border border-[#D1E5E5] rounded-xl focus:ring-2 focus:ring-[#0D9488] text-xs bg-[#F2F8F8] text-[#0F2D2D]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2EEEE] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D1E5E5] text-[#526E6E] font-semibold hover:bg-[#F2F8F8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0D9488] text-white font-bold hover:bg-[#0F766E] shadow-sm"
                >
                  {editingId ? 'Simpan Perubahan' : 'Tambah Sub-Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
