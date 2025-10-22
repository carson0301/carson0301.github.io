import { useState, useEffect, useRef } from 'react';
import { Upload, Users, Award } from 'lucide-react';

declare const XLSX: any;

interface Student {
  name: string;
  score: number;
  picked: boolean;
}

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classStarted, setClassStarted] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pickedStudents, setPickedStudents] = useState<Student[]>([]);

  const [schoolYear, setSchoolYear] = useState('');
  const [classTime, setClassTime] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initParticles();
  }, []);

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const particleCount = 80;
    const mouse = { x: 0, y: 0 };

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 2,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          particle.x -= dx / distance * 2;
          particle.y -= dy / distance * 2;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const studentNames: Student[] = [];
      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        if (row[1] && typeof row[1] === 'string' && row[1].trim() !== '' && !row[1].includes('學生姓名') && !row[1].includes('文組') && !row[1].includes('理組')) {
          studentNames.push({
            name: row[1].trim(),
            score: 0,
            picked: false
          });
        }
      }

      setStudents(studentNames);
    };

    reader.readAsArrayBuffer(file);
  };

  const startClass = () => {
    setClassStarted(true);
    setPickedStudents([]);
    setSelectedStudent(null);
    setStudents(students.map(s => ({ ...s, picked: false })));
  };

  const endClass = () => {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const fileName = `${schoolYear || '2526'}${className || '某班'}_${subject || 'AI課堂'}加分(${year}/${month}/${day}_${hours}:${minutes}更新).xlsx`;

    const exportData = [
      ['學生姓名', '分數'],
      ...pickedStudents.map(s => [s.name, s.score])
    ];

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '課堂分數');
    XLSX.writeFile(wb, fileName);

    setClassStarted(false);
    setSelectedStudent(null);
  };

  const pickRandomStudent = () => {
    if (students.length === 0) return;

    const availableStudents = students.filter(s => !s.picked);
    if (availableStudents.length === 0) {
      alert('所有學生都已被抽中！');
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableStudents.length);
    const selected = availableStudents[randomIndex];

    setSelectedStudent(selected);
    setStudents(students.map(s =>
      s.name === selected.name ? { ...s, picked: true } : s
    ));
  };

  const adjustScore = (delta: number) => {
    if (!selectedStudent) return;

    const updatedStudent = {
      ...selectedStudent,
      score: Math.max(0, selectedStudent.score + delta)
    };

    setSelectedStudent(updatedStudent);
    setStudents(students.map(s =>
      s.name === updatedStudent.name ? updatedStudent : s
    ));

    const existingIndex = pickedStudents.findIndex(s => s.name === updatedStudent.name);
    if (existingIndex >= 0) {
      setPickedStudents(pickedStudents.map(s =>
        s.name === updatedStudent.name ? updatedStudent : s
      ));
    } else {
      setPickedStudents([...pickedStudents, updatedStudent]);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />

      <div className="min-h-screen relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-12 text-gray-800">
            學生抽籤與分數追蹤器
          </h1>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">上傳學生名單</h2>
            </div>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileUpload}
              className="block w-full text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 focus:outline-none p-3"
            />
            {students.length > 0 && (
              <p className="mt-4 text-gray-600 font-medium">
                已載入 {students.length} 位學生
              </p>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">課堂相關資料</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="學年：2526"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="時間：13:45"
                value={classTime}
                onChange={(e) => setClassTime(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="班級：高一甲"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="課堂：人工智能"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="授課老師：陳大明老師"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
              />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex gap-4 justify-center">
              <button
                onClick={startClass}
                disabled={students.length === 0 || classStarted}
                className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-xl"
              >
                上課
              </button>
              <button
                onClick={endClass}
                disabled={!classStarted}
                className="px-10 py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-xl"
              >
                下課
              </button>
            </div>
          </div>

          {classStarted && (
            <>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
                <button
                  onClick={pickRandomStudent}
                  className="w-full px-8 py-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-2xl text-2xl mb-6"
                >
                  隨機抽選學生
                </button>

                {selectedStudent && (
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8 mb-6">
                      <p className="text-gray-600 text-lg mb-2">抽中的學生：</p>
                      <p className="text-5xl font-bold text-gray-800 mb-4">
                        {selectedStudent.name}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-2xl text-gray-700">
                        <Award className="w-8 h-8" />
                        <span className="font-semibold">目前分數：{selectedStudent.score}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => adjustScore(1)}
                        className="px-10 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-lg"
                      >
                        答對 +1分
                      </button>
                      <button
                        onClick={() => adjustScore(-1)}
                        className="px-10 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-lg"
                      >
                        答錯 -1分
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {pickedStudents.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-semibold text-gray-800">
                      本節課已抽中的學生
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pickedStudents.map((student, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-800">
                            {student.name}
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            {student.score} 分
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
