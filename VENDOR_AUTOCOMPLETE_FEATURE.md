# Vendor Autocomplete Feature

## Fitur Baru: History Vendor dengan Autocomplete ✅

Saat membuat SPK baru, form vendor sekarang memiliki fitur autocomplete yang menampilkan vendor yang pernah diinput sebelumnya.

### Cara Kerja

1. **Ketik Nama Vendor**: Mulai ketik nama vendor di field "Vendor Name"
2. **Lihat Suggestions**: Dropdown akan muncul menampilkan vendor yang cocok dari history
3. **Pilih Vendor**: Klik vendor yang diinginkan
4. **Auto-Fill**: Email, phone, dan address akan otomatis terisi!

### Fitur

- ✅ **Search History**: Cari vendor berdasarkan nama (case-insensitive)
- ✅ **Auto-Fill**: Semua data vendor (email, phone, address) terisi otomatis
- ✅ **Preview Info**: Tampilan dropdown menunjukkan email dan phone untuk identifikasi
- ✅ **New Vendor Support**: Tetap bisa input vendor baru jika tidak ada di history
- ✅ **Click Outside**: Dropdown otomatis tertutup saat klik di luar
- ✅ **Real-time Filter**: Hasil filter update seiring Anda mengetik

### Implementation Details

**Files Created:**

1. `app/actions/vendor.ts` - Server action untuk fetch vendor history
2. `components/vendor-autocomplete.tsx` - Autocomplete component dengan dropdown

**Files Modified:**

1. `components/spk-create-form.tsx` - Mengganti input vendor dengan autocomplete

### Data Source

Vendor history diambil dari table `spk` dengan query:

- Mengambil vendor yang unik (berdasarkan nama)
- Diurutkan berdasarkan created_at (terbaru di atas)
- Menyimpan nama, email, phone, dan address

### UX Benefits

- **Lebih Cepat**: Tidak perlu ketik ulang data vendor yang sama
- **Konsisten**: Data vendor tetap sama (hindari typo)
- **User Friendly**: Dropdown intuitif dengan preview informasi
- **Flexible**: Tetap support input manual untuk vendor baru

### Technical Stack

- React Hooks: `useState`, `useEffect`, `useRef`
- Server Actions: Next.js 14 App Router
- Supabase: Database query untuk vendor history
- TypeScript: Full type safety

### Example Usage

```typescript
// Ketika user memilih vendor dari dropdown:
handleVendorSelect({
  vendor_name: "PT Vendor Jaya",
  vendor_email: "vendor@jaya.com",
  vendor_phone: "+62-811-2233-4455",
  vendor_address: "Jl. Vendor No. 123",
});

// Semua field otomatis terisi!
```

### Future Enhancements (Optional)

- [ ] Tambahkan badge "Recently Used" untuk vendor yang sering dipakai
- [ ] Sort by frequency of use
- [ ] Fuzzy search algorithm untuk hasil lebih baik
- [ ] Cache vendor list di localStorage
- [ ] Tambahkan button "Clear" untuk reset vendor selection
