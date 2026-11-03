import { Email, Task } from '../types';

// Format helper to get dates relative to today
const getRelativeDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_EMAILS: Email[] = [
  {
    id: 'em-1',
    sender: {
      name: 'Анна Ковалева',
      email: 'a.kovaleva@techflow.io',
      initials: 'АК',
      color: 'bg-emerald-600',
    },
    to: ['me@nexusmail.app'],
    subject: 'Согласование дизайн-системы и плана релиза v2.4',
    snippet: 'Привет! Прикрепила финальные макеты компонентов и таймлайн релиза на следующий спринт. Пожалуйста, посмотри до четверга...',
    body: `Привет!

Мы закончили подготовку дизайн-системы для новой версии v2.4. В архиве все утвержденные компоненты, включая темную тему, улучшенную типографику и мобильные шаблоны.

Ключевые моменты для обсуждения:
1. Архитектура состояний компонентов таблиц и фильтров.
2. Согласование дат релиза с отделом маркетинга (предварительно 14-е число).
3. Список критических задач для фронтенд-команды.

Пожалуйста, посмотри макеты до четверга (18:00) и дай обратную связь по оценке трудозатрат разработки.

С уважением,
Анна Ковалева
Lead Product Designer`,
    date: 'Сегодня',
    time: '10:45',
    timestamp: Date.now() - 1000 * 60 * 35,
    folder: 'inbox',
    labels: ['Проекты', 'Срочно'],
    isRead: false,
    isStarred: true,
    attachments: [
      { id: 'att-1', name: 'Design_System_Spec_v2.4.pdf', size: '4.2 МБ', type: 'pdf' },
      { id: 'att-2', name: 'Release_Roadmap_Q4.xlsx', size: '820 КБ', type: 'spreadsheet' },
    ],
    taskId: 'tsk-1', // Linked to task
  },
  {
    id: 'em-2',
    sender: {
      name: 'Елена Васильева',
      email: 'elena.v@capitalventures.com',
      initials: 'ЕВ',
      color: 'bg-violet-600',
    },
    to: ['me@nexusmail.app'],
    subject: 'Подготовка к квартальному демо для инвесторов',
    snippet: 'Добрый день! В следующую среду у нас запланирован звонок с фондом. Нужна обновленная статистика по ключевым метрикам...',
    body: `Добрый день!

В следующую среду у нас запланирован важный звонок с инвестиционным комитетом. Нам необходимо подготовить слайд с динамикой конверсий, активных пользователей и текущим статусом внедрения новых фичей.

Что нужно сделать:
- Выгрузить сводную аналитику за последние 3 месяца;
- Подготовить 3-4 ключевых вывода о росте retention;
- Сформировать предварительную презентацию в 5-7 слайдов.

Давай созвонимся завтра в 14:00 для короткого синка на 15 минут.

С уважением,
Елена Васильева
Управляющий партнер`,
    date: 'Сегодня',
    time: '09:15',
    timestamp: Date.now() - 1000 * 60 * 120,
    folder: 'inbox',
    labels: ['Клиенты', 'Срочно'],
    isRead: false,
    isStarred: true,
    attachments: [
      { id: 'att-3', name: 'Investor_Deck_Template.pptx', size: '12.5 МБ', type: 'presentation' },
    ],
    taskId: 'tsk-2',
  },
  {
    id: 'em-3',
    sender: {
      name: 'Михаил Соколов',
      email: 'm.sokolov@infra-cloud.ru',
      initials: 'МС',
      color: 'bg-blue-600',
    },
    to: ['me@nexusmail.app'],
    subject: 'Счет на оплату серверов и баз данных (Q4) #INV-8821',
    snippet: 'Выставлен счет за услуги облачного хостинга и вычислительных мощностей за текущий расчетный период. Оплата до пятницы...',
    body: `Здравствуйте!

Направляем счет за услуги инфраструктуры серверов и управляемых баз данных PostgreSQL за предыдущий отчетный месяц.

Номер счета: INV-8821
Сумма к оплате: 48,250 ₽
Срок оплаты: до конца текущей рабочей недели.

Акт сверки и детализация потребления ресурсов во вложении.

Служба расчетов ООО «Инфра-Клауд»`,
    date: 'Вчера',
    time: '16:30',
    timestamp: Date.now() - 1000 * 60 * 60 * 20,
    folder: 'inbox',
    labels: ['Финансы'],
    isRead: true,
    isStarred: false,
    attachments: [
      { id: 'att-4', name: 'Invoice_INV_8821.pdf', size: '210 КБ', type: 'pdf' },
      { id: 'att-5', name: 'Infrastructure_Usage_Details.csv', size: '54 КБ', type: 'csv' },
    ],
  },
  {
    id: 'em-4',
    sender: {
      name: 'Марк Браун',
      email: 'mark@globaltech-solutions.com',
      initials: 'МБ',
      color: 'bg-amber-600',
    },
    to: ['me@nexusmail.app'],
    subject: 'Предложение по интеграции API и совместному проекту',
    snippet: 'Приветствуем! Мы изучили ваш сервис и видим отличную синергию для интеграции нашего платежного шлюза...',
    body: `Здравствуйте!

Меня зовут Марк, я руковожу направлением технологических партнерств в GlobalTech Solutions.

Мы внимательно изучили ваш продукт и считаем, что интеграция с нашим API позволит пользователям мгновенно проводить трансграничные расчеты без переключения в сторонние окна.

Предлагаем провести короткий демо-звонок в четверг или пятницу во второй половине дня, чтобы показать готовый прототип виджета.

Будет ли вам удобно подключиться на 20 минут в Zoom?

Best regards,
Mark Brown
Head of Partnerships`,
    date: 'Вчера',
    time: '14:10',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    folder: 'inbox',
    labels: ['Клиенты'],
    isRead: true,
    isStarred: false,
  },
  {
    id: 'em-5',
    sender: {
      name: 'DevOps Alerting',
      email: 'no-reply@monitoring.internal',
      initials: 'DA',
      color: 'bg-rose-600',
    },
    to: ['me@nexusmail.app'],
    subject: '[Решено] Автоматическое обновление SSL-сертификатов на prod',
    snippet: 'Все сертификаты успешно обновлены и синхронизированы на всех балансировщиках нагрузки. Действительны до ноября следующего года...',
    body: `Системное оповещение:

Регулярная процедура ротации TLS/SSL wildcard сертификатов *.company.internal успешно завершена.

- Статус: OK
- Обновлено серверов: 8/8
- Время выполнения: 12.4s
- Следующая плановая ротация: через 90 дней.

Никаких ручных действий не требуется.`,
    date: '28 окт',
    time: '04:00',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    folder: 'archive',
    labels: [],
    isRead: true,
    isStarred: false,
  },
  {
    id: 'em-6',
    sender: {
      name: 'Дмитрий Орлов',
      email: 'd.orlov@creative-lab.pro',
      initials: 'ДО',
      color: 'bg-teal-600',
    },
    to: ['me@nexusmail.app'],
    subject: 'Черновик статьи для корпоративного блога',
    snippet: 'Подготовил черновик статьи о переходе на новую модульную архитектуру. Жду твоих правок и комментариев перед версткой...',
    body: `Привет!

Написал текст о том, как мы оптимизировали время загрузки интерфейса и сократили размер бандла на 45%. 

Проверь, пожалуйста:
1. Корректность технических терминов в разделе про серверный рендеринг;
2. Графики производительности (до и после);
3. Цитаты разработчиков.

Если все ок, в понедельник передаем в верстку и публикуем на Хабре.`,
    date: '27 окт',
    time: '18:20',
    timestamp: Date.now() - 1000 * 60 * 60 * 96,
    folder: 'inbox',
    labels: ['Проекты'],
    isRead: true,
    isStarred: false,
    taskId: 'tsk-3',
  },
  {
    id: 'em-7',
    sender: {
      name: 'Nexus Security',
      email: 'security@nexusmail.app',
      initials: 'NS',
      color: 'bg-slate-700',
    },
    to: ['me@nexusmail.app'],
    subject: 'Успешный вход в систему с нового устройства (MacBook Pro)',
    snippet: 'Зафиксирован вход в вашу учетную запись sergtroian@gmail.com из браузера Chrome на macOS. Если это были вы, подтверждения не требуется...',
    body: `Здравствуйте!

Был совершен вход в ваш почтовый аккаунт:
- Устройство: Apple MacBook Pro
- Браузер: Google Chrome 130
- Локация: Санкт-Петербург, Россия
- IP: 188.134.72.***

Если вы не совершали этот вход, немедленно смените пароль и завершите все активные сессии в настройках безопасности.`,
    date: '26 окт',
    time: '11:02',
    timestamp: Date.now() - 1000 * 60 * 60 * 120,
    folder: 'archive',
    labels: [],
    isRead: true,
    isStarred: false,
  },
  {
    id: 'em-8',
    sender: {
      name: 'Я',
      email: 'me@nexusmail.app',
      initials: 'Я',
      color: 'bg-indigo-600',
    },
    to: ['accounting@company.com'],
    subject: 'Re: Акт приема-передачи выполненных работ за сентябрь',
    snippet: 'Добрый день! Подписанный скан документа прикрепляю к письму. Оригинал отправлен курьерской службой сегодня утром...',
    body: `Добрый день!

Подписанный со своей стороны скан акта приема-передачи выполненных работ за сентябрь прикрепляю к письму.

Оригинал отправлен курьерской службой сегодня утром. Трек-номер для отслеживания: RU-928192839.

Спасибо за сотрудничество!`,
    date: '25 окт',
    time: '15:40',
    timestamp: Date.now() - 1000 * 60 * 60 * 140,
    folder: 'sent',
    labels: ['Финансы'],
    isRead: true,
    isStarred: false,
    attachments: [
      { id: 'att-6', name: 'Signed_Act_September.pdf', size: '1.1 МБ', type: 'pdf' },
    ],
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-1',
    title: 'Проверить макеты дизайн-системы v2.4 и таймлайн релиза',
    description: 'Оценить трудозатраты для фронтенда, проверить адаптивные сетки и согласовать сроки с Анной Ковалевой.',
    status: 'in_progress',
    priority: 'high',
    dueDate: getRelativeDate(0), // Today!
    dueTime: '17:00',
    estimateMinutes: 45,
    emailId: 'em-1',
    emailSubject: 'Согласование дизайн-системы и плана релиза v2.4',
    emailSender: 'Анна Ковалева',
    tags: ['Дизайн', 'Спринт'],
    checklist: [
      { id: 'chk-1', text: 'Изучить PDF спецификацию компонентов', completed: true },
      { id: 'chk-2', text: 'Проверить состояния таблиц и фильтров', completed: true },
      { id: 'chk-3', text: 'Написать ответное письмо с оценкой часов', completed: false },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'tsk-2',
    title: 'Собрать статистику и 5 слайдов для инвесторского демо',
    description: 'Выгрузить графики по активным пользователям и retention за 3 месяца для созвона с Еленой Васильевой.',
    status: 'todo',
    priority: 'urgent',
    dueDate: getRelativeDate(0), // Today!
    dueTime: '19:00',
    estimateMinutes: 90,
    emailId: 'em-2',
    emailSubject: 'Подготовка к квартальному демо для инвесторов',
    emailSender: 'Елена Васильева',
    tags: ['Отчетность', 'Инвесторы'],
    checklist: [
      { id: 'chk-4', text: 'Выгрузить данные из метрики', completed: false },
      { id: 'chk-5', text: 'Заполнить шаблон презентации', completed: false },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 'tsk-3',
    title: 'Вычитать черновик статьи для Хабра про архитектуру',
    description: 'Проверить технические детали про сокращение бандла и согласовать графики с Дмитрием.',
    status: 'todo',
    priority: 'medium',
    dueDate: getRelativeDate(1), // Tomorrow
    dueTime: '14:00',
    estimateMinutes: 30,
    emailId: 'em-6',
    emailSubject: 'Черновик статьи для корпоративного блога',
    emailSender: 'Дмитрий Орлов',
    tags: ['Блог', 'PR'],
    checklist: [
      { id: 'chk-6', text: 'Проверить терминологию SSR', completed: false },
      { id: 'chk-7', text: 'Оставить замечания в Google Docs', completed: false },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
  },
  {
    id: 'tsk-4',
    title: 'Передать счет за хостинг #INV-8821 в бухгалтерию',
    description: 'Оплата за серверы Q4 должна пройти до пятницы.',
    status: 'waiting',
    priority: 'medium',
    dueDate: getRelativeDate(2), // In 2 days
    dueTime: '12:00',
    estimateMinutes: 15,
    emailId: 'em-3',
    emailSubject: 'Счет на оплату серверов и баз данных (Q4) #INV-8821',
    emailSender: 'Михаил Соколов',
    tags: ['Финансы'],
    checklist: [
      { id: 'chk-8', text: 'Прикрепить счет в учетную систему', completed: true },
      { id: 'chk-9', text: 'Получить подтверждение от бухгалтера', completed: false },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
  },
  {
    id: 'tsk-5',
    title: 'Провести еженедельный обзор бэклога и расставить приоритеты',
    description: 'Плановая регулярная задача по синхронизации спринта.',
    status: 'done',
    priority: 'low',
    dueDate: getRelativeDate(-1), // Yesterday
    dueTime: '11:00',
    estimateMinutes: 40,
    tags: ['Планирование'],
    checklist: [
      { id: 'chk-10', text: 'Архивировать закрытые тикеты', completed: true },
      { id: 'chk-11', text: 'Обновить статусы в Kanban', completed: true },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    completedAt: Date.now() - 1000 * 60 * 60 * 20,
  },
];
