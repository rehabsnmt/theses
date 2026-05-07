import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, BookOpen, User, GraduationCap, Tag, Loader2, LogIn, LogOut, Trash2, Plus } from 'lucide-react';

// --- CẤU HÌNH FIREBASE ---
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDxZZRBDcb9606mNYXxXeLpgK2p1xfGF9A",
  authDomain: "theses-3fdce.firebaseapp.com",
  projectId: "theses-3fdce",
  storageBucket: "theses-3fdce.firebasestorage.app",
  messagingSenderId: "660887163293",
  appId: "1:660887163293:web:caeaece108f6fd96cddf74",
  measurementId: "G-5LR1NLCMT0"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// -------------------------

const categories = [
  'Tất cả',
  'Công nghệ phần mềm',
  'Trí tuệ nhân tạo',
  'Hệ thống thông tin',
  'Mạng máy tính',
  'Khoa học dữ liệu',
  'An toàn thông tin'
];

export default function App() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  // State cho Authentication (Admin)
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  // State cho Form nhập liệu
  const [formData, setFormData] = useState({ 
    title: '', 
    author: '', 
    advisor: '', 
    category: 'Công nghệ phần mềm' 
  });

  // Khởi chạy khi tải trang
  useEffect(() => {
    // 1. Lắng nghe trạng thái đăng nhập
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    // 2. Lấy dữ liệu Realtime từ Firestore
    const thesesRef = collection(db, 'theses');
    const unsubscribeData = onSnapshot(thesesRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTheses(data);
      setLoading(false);
    }, (error) => {
      console.error("Lỗi khi tải dữ liệu:", error);
      setLoading(false);
    });

    return () => { 
      unsubscribeAuth(); 
      unsubscribeData(); 
    };
  }, []);

  // --- CÁC HÀM XỬ LÝ ---

  // Xử lý Đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      alert("Sai tài khoản hoặc mật khẩu! Vui lòng thử lại.");
    }
  };

  // Xử lý Thêm đề tài mới
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "theses"), formData);
      setFormData({ title: '', author: '', advisor: '', category: 'Công nghệ phần mềm' });
    } catch (error) {
      console.error("Lỗi thêm dữ liệu: ", error);
      alert("Không thể thêm dữ liệu. Vui lòng kiểm tra quyền truy cập.");
    }
  };

  // Xử lý Xóa đề tài
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đề tài này không?")) {
      try {
        await deleteDoc(doc(db, "theses", id));
      } catch (error) {
        console.error("Lỗi xóa dữ liệu: ", error);
        alert("Không thể xóa. Vui lòng kiểm tra quyền truy cập.");
      }
    }
  };

  // Lọc dữ liệu theo Tìm kiếm và Danh mục
  const filteredTheses = useMemo(() => {
    return theses.filter((thesis) => {
      const title = thesis.title || "";
      const author = thesis.author || "";
      const advisor = thesis.advisor || "";

      const matchesSearch = 
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        advisor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'Tất cả' || thesis.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, theses]);

  // --- GIAO DIỆN ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Nút Đăng nhập */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Hệ Thống Lưu Trữ Luận Văn</h1>
            </div>
            <p className="text-slate-500 text-lg">Tra cứu cơ sở dữ liệu khóa luận, luận văn tốt nghiệp</p>
          </div>
          
          {user ? (
            <button 
              onClick={() => signOut(auth)} 
              className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
            >
              <LogOut size={18} /> Đăng xuất Admin
            </button>
          ) : (
            <button 
              onClick={() => setShowLogin(!showLogin)} 
              className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 transition"
            >
              <LogIn size={18} /> Quản trị viên
            </button>
          )}
        </header>

        {/* Form Đăng nhập */}
        {showLogin && !user && (
          <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-sm ml-auto border border-blue-100 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-lg mb-4 text-slate-800">Đăng nhập Quản trị</h3>
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full border border-slate-300 p-2.5 mb-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              className="w-full border border-slate-300 p-2.5 mb-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={password}
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
              Đăng nhập
            </button>
          </form>
        )}

        {/* Khung Thêm Đề Tài (Chỉ hiện khi đã đăng nhập) */}
        {user && (
          <div className="bg-blue-50/50 p-6 rounded-xl mb-8 border border-blue-200 shadow-sm">
            <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-blue-600"/> Thêm đề tài mới
            </h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <input 
                className="border border-blue-200 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none lg:col-span-2" 
                placeholder="Tên đề tài..." 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
              />
              <input 
                className="border border-blue-200 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Tác giả" 
                value={formData.author} 
                onChange={e => setFormData({...formData, author: e.target.value})} 
                required 
              />
              <input 
                className="border border-blue-200 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="GV hướng dẫn" 
                value={formData.advisor} 
                onChange={e => setFormData({...formData, advisor: e.target.value})} 
                required 
              />
              <div className="flex gap-2 lg:flex-col xl:flex-row">
                <select 
                  className="border border-blue-200 p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none flex-1" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {categories.filter(c => c !== 'Tất cả').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition xl:w-24">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Thanh Tìm kiếm & Lọc */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tìm kiếm theo tên đề tài, tác giả hoặc GVHD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-slate-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bảng Dữ liệu */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-semibold w-16 text-center">STT</th>
                  <th className="p-4 font-semibold min-w-[250px]">Tên Đề Tài</th>
                  <th className="p-4 font-semibold min-w-[180px]">Tác Giả / GVHD</th>
                  <th className="p-4 font-semibold min-w-[160px]">Phân Loại</th>
                  {user && <th className="p-4 font-semibold w-24 text-center">Xóa</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={user ? 5 : 4} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-blue-600">
                        <Loader2 className="w-10 h-10 animate-spin mb-2" />
                        <p className="font-medium">Đang tải dữ liệu từ Firebase...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTheses.length > 0 ? (
                  filteredTheses.map((thesis, index) => (
                    <tr key={thesis.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {thesis.title}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">{thesis.author}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            <span>{thesis.advisor}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                          <Tag className="w-3 h-3" />
                          {thesis.category}
                        </div>
                      </td>
                      {user && (
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDelete(thesis.id)} 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa đề tài này"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={user ? 5 : 4} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <BookOpen className="w-12 h-12 text-slate-200 mb-3" />
                        <p className="text-lg font-medium">Không tìm thấy kết quả nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-slate-50 border-t border-slate-200 p-4 text-sm text-slate-500 flex justify-between items-center">
            <span>Hiển thị <strong>{filteredTheses.length}</strong> kết quả</span>
            {!loading && <span className="hidden sm:flex items-center gap-2">Trực tuyến từ Firebase <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span></span>}
          </div>
        </div>

      </div>
    </div>
  );
}
