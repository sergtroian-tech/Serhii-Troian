import React, { useState } from 'react';
import { Download, X, CheckCircle2, FileArchive, Terminal, Monitor, Bookmark, Loader2, Info } from 'lucide-react';
import { downloadProjectZip } from '../utils/downloadZip';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'app' | 'zip'>('app');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    setIsSuccess(false);
    try {
      await downloadProjectZip();
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                Как пользоваться и установить NexusMail
              </h3>
              <p className="text-[11px] text-slate-400">Работает прямо в браузере или как отдельная программа</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('app')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'app'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Без скачивания и распаковок (Рекомендуется)
          </button>
          <button
            onClick={() => setActiveTab('zip')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'zip'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Архив ZIP (Для разработчиков)
          </button>
        </div>

        {/* Content Tab 1: How to use as App without downloading */}
        {activeTab === 'app' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">
                  Вам НЕ нужно ничего распаковывать или устанавливать вручную!
                </h4>
                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-1 leading-relaxed">
                  NexusMail — это современное облачное приложение (как Gmail или Яндекс.Почта). Оно уже полностью работает прямо сейчас на этой странице.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Два простых способа запуска:
              </div>

              {/* Way 1 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                    Сохранить в закладки браузера
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Нажмите <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-mono">Ctrl + D</kbd> (на Mac: <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-mono">Cmd + D</kbd>) или звёздочку в строке браузера. Вы сможете открывать почту и задачи в любой момент!
                  </p>
                </div>
              </div>

              {/* Way 2 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                    Установить как отдельное приложение (PWA)
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    В правом конце адресной строки вашего браузера (Chrome, Edge, Яндекс) нажмите иконку <strong>«Установить NexusMail»</strong> (или меню <strong>⋮</strong> → «Установить приложение»). Оно появится на вашем рабочем столе с собственной иконкой и будет открываться в отдельном окне без адресной строки!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors cursor-pointer text-center"
              >
                Понятно, продолжить работу в приложении
              </button>
            </div>
          </div>
        )}

        {/* Content Tab 2: ZIP download for developers */}
        {activeTab === 'zip' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold">
                <span className="flex items-center gap-1.5">
                  <FileArchive className="w-4 h-4 text-indigo-500" />
                  nexusmail-app.zip (~58 КБ)
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                  Для программистов
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Этот ZIP-архив содержит исходный код программы (React, TypeScript, CSS). Он нужен <strong>только разработчикам</strong>, если они хотят изменить код программы или запустить её на своем локальном сервере через команду <code className="font-mono">npm run dev</code>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Запуск из архива (для разработчиков):</span>
              </div>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-[11px] space-y-1">
                <div className="text-slate-400"># Установить библиотеки и запустить</div>
                <div className="text-emerald-400">npm install</div>
                <div className="text-emerald-400">npm run dev</div>
              </div>
            </div>

            {isSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>Файл <strong>nexusmail-app.zip</strong> успешно скачан!</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Формирование архива...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Скачать ZIP с исходным кодом</span>
                  </>
                )}
              </button>

              <a
                href="/nexusmail-app.zip"
                download="nexusmail-app.zip"
                className="w-full sm:w-auto px-4 py-2.5 text-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors cursor-pointer"
              >
                Прямой файл
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
