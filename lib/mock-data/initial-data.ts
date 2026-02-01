// Initial fake data untuk live demo

export const initialEvents = [
  {
    id: "1",
    title: "Workshop Web Development Modern",
    description:
      "Pelajari teknologi web terbaru seperti React, Next.js, dan TypeScript. Workshop ini cocok untuk pemula hingga menengah yang ingin mengembangkan skill web development mereka.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Gedung A, Ruang 101, Universitas Indonesia",
    price: 150000,
    category: "Teknologi",
    poster_url: "/placeholder.jpg",
    rating: 4.8,
    user_id: "teacher-1",
    capacity: 50,
    time: "09:00",
    participants: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Seminar Kesehatan Mental Remaja",
    capacity: 200,
    time: "14:00",
    participants: 0,
    description:
      "Diskusi penting tentang kesehatan mental di kalangan remaja dengan psikolog berpengalaman. Dapatkan tips dan strategi untuk menjaga kesehatan mental.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 hari dari sekarang
    location: "Auditorium Pusat, Kampus Depok",
    price: 0,
    category: "Kesehatan",
    poster_url: "/placeholder.jpg",
    rating: 4.9,
    user_id: "teacher-2",
    participants: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Kompetisi Matematika Nasional",
    description:
      "Uji kemampuan matematika kamu di kompetisi tingkat nasional. Terbuka untuk semua siswa SMA/SMK. Hadiah total puluhan juta rupiah!",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Gedung Serbaguna, Jakarta Selatan",
    price: 75000,
    category: "Matematika",
    poster_url: "/placeholder.jpg",
    rating: 4.7,
    user_id: "teacher-1",
    capacity: 100,
    time: "08:00",
    participants: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Workshop Desain Grafis dengan Figma",
    description:
      "Pelajari cara membuat desain yang menarik menggunakan Figma. Dari dasar hingga teknik lanjutan untuk membuat UI/UX yang profesional.",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Lab Komputer, Fakultas Teknik",
    price: 200000,
    category: "Seni",
    poster_url: "/placeholder.jpg",
    rating: 4.6,
    user_id: "teacher-3",
    capacity: 30,
    time: "10:00",
    participants: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Seminar Lingkungan Hidup",
    description:
      "Diskusi tentang isu-isu lingkungan terkini dan solusi yang bisa kita lakukan. Dengan pembicara dari aktivis lingkungan berpengalaman.",
    date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Aula Besar, Kampus UI",
    price: 0,
    category: "Lingkungan",
    poster_url: "/placeholder.jpg",
    rating: 4.5,
    user_id: "teacher-2",
    capacity: 150,
    time: "13:00",
    participants: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Bootcamp Data Science untuk Pemula",
    description:
      "Pelajari dasar-dasar data science, Python, dan machine learning. Cocok untuk yang baru mulai belajar data science.",
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Online via Zoom",
    price: 300000,
    category: "Teknologi",
    poster_url: "/placeholder.jpg",
    rating: 4.9,
    user_id: "teacher-1",
    capacity: 40,
    time: "09:00",
    participants: 0,
    created_at: new Date().toISOString(),
  },
];

export const initialProfiles = [
  {
    id: "teacher-1",
    full_name: "Dr. Ahmad Wijaya",
    role: "teacher",
    email: "ahmad.wijaya@example.com",
    created_at: new Date().toISOString(),
  },
  {
    id: "teacher-2",
    full_name: "Prof. Siti Nurhaliza",
    role: "teacher",
    email: "siti.nurhaliza@example.com",
    created_at: new Date().toISOString(),
  },
  {
    id: "teacher-3",
    full_name: "Budi Santoso, M.Kom",
    role: "teacher",
    email: "budi.santoso@example.com",
    created_at: new Date().toISOString(),
  },
  {
    id: "buyer-1",
    full_name: "John Doe",
    role: "buyer",
    email: "john.doe@example.com",
    created_at: new Date().toISOString(),
  },
];

export const initialParticipants = [
  {
    id: "part-1",
    user_id: "buyer-1",
    event_id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "08123456789",
    status: "verified",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "part-2",
    user_id: "buyer-2",
    event_id: "1",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "08198765432",
    status: "verified",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "part-3",
    user_id: "buyer-3",
    event_id: "1",
    name: "Ahmad Rizki",
    email: "ahmad@example.com",
    phone: "08211122334",
    status: "pending",
    created_at: new Date().toISOString(),
  },
];

export const initialWishlist: any[] = [];

// Fake user untuk demo
export const demoUsers = {
  teacher: {
    id: "teacher-1",
    email: "teacher@demo.com",
    user_metadata: {
      full_name: "Dr. Ahmad Wijaya",
      role: "teacher",
    },
  },
  buyer: {
    id: "buyer-1",
    email: "buyer@demo.com",
    user_metadata: {
      full_name: "John Doe",
      role: "buyer",
    },
  },
};
