import React, { useState, useRef } from 'react';
import { Download, Upload, Database, Cloud, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { downloadBackup, parseBackupFile, getSyncUrl, saveSyncUrl } from '../services/storage';
import { Account, Transaction } from '../types';

interface SettingsViewProps {
  onImportData: (accounts: Account[], transactions: Transaction[]) => void;
  accountsCount: number;
  transactionsCount: number;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onImportData, accountsCount, transactionsCount }) => {
  const [syncUrl, setSyncUrl] = useState(getSyncUrl());
  const [urlSaved, setUrlSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  const handleSaveUrl = () => {
    saveSyncUrl(syncUrl);
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { accounts, transactions } = await parseBackupFile(file);
      if (window.confirm(`هل أنت متأكد من استعادة النسخة؟ \nسيتم استبدال البيانات الحالية بـ ${accounts.length} حساب و ${transactions.length} عملية.`)) {
        onImportData(accounts, transactions);
        setImportStatus('تمت استعادة البيانات بنجاح!');
      }
    } catch (error) {
      alert('حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف JSON صالح.');
      setImportStatus('فشل الاستعادة.');
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setImportStatus(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Backup Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="text-primary-600" />
          النسخ الاحتياطي والاستعادة
        </h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          بياناتك محفوظة حالياً في متصفحك. لضمان عدم فقدان البيانات (في حال مسح ذاكرة المتصفح أو تغيير الجهاز)، 
          قم بتحميل نسخة احتياطية بشكل دوري.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg flex flex-col items-center text-center gap-3">
            <Download size={32} className="text-blue-600" />
            <h3 className="font-bold text-blue-900">تحميل نسخة كاملة</h3>
            <p className="text-xs text-blue-700">تنزيل ملف (JSON) يحتوي على كل الحسابات والعمليات.</p>
            <button 
              onClick={downloadBackup}
              className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              تنزيل النسخة الاحتياطية
            </button>
          </div>

          <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg flex flex-col items-center text-center gap-3">
            <Upload size={32} className="text-gray-600" />
            <h3 className="font-bold text-gray-900">استعادة نسخة</h3>
            <p className="text-xs text-gray-600">رفع ملف (JSON) لاسترجاع البيانات السابقة.</p>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
            >
              رفع ملف النسخة
            </button>
            {importStatus && <span className="text-xs font-bold text-green-600">{importStatus}</span>}
          </div>
        </div>
      </div>

      {/* Cloud Sync Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Cloud className="text-purple-600" />
          الربط السحابي (Google Sheets)
        </h2>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
           <h4 className="font-bold text-purple-900 text-sm mb-2">كيف تعمل هذه الميزة؟</h4>
           <ol className="list-decimal list-inside text-xs text-purple-800 space-y-1">
             <li>قم بإنشاء Google Sheet جديد.</li>
             <li>اذهب إلى Extensions {'>'} Apps Script.</li>
             <li>الصق الكود البرمجي (الذي سيوفره المطور).</li>
             <li>اعمل Deploy واختر "Anyone".</li>
             <li>الصق الرابط (Web App URL) في الأسفل.</li>
           </ol>
           <p className="text-xs mt-2 text-purple-600 font-medium">
             سيقوم التطبيق بإرسال نسخة من البيانات تلقائياً عند أي تعديل.
           </p>
        </div>

        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-left ltr"
            value={syncUrl}
            onChange={(e) => setSyncUrl(e.target.value)}
            dir="ltr"
          />
          <button 
            onClick={handleSaveUrl}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${urlSaved ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {urlSaved ? <Check size={18} /> : <RefreshCw size={18} />}
            {urlSaved ? 'تم الحفظ' : 'حفظ الرابط'}
          </button>
        </div>
      </div>

      {/* Info Stats */}
      <div className="text-center text-sm text-gray-500 mt-8">
        يحتوي النظام حالياً على <span className="font-bold">{accountsCount}</span> حساب و <span className="font-bold">{transactionsCount}</span> عملية مسجلة.
      </div>
    </div>
  );
};

export default SettingsView;