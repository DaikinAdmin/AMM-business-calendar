# AMM Бізнес Календар 📅

Повнофункціональна система управління проектами, зустрічами та завданнями для компанії, побудована на Next.js 14, React та react-big-calendar.

## ✨ Функціональність

### 📊 Дашборд
- Огляд поточної активності компанії
- Статистика проектів, зустрічей та працівників
- Найближчі зустрічі на тиждень
- Активні проекти

### 📅 Календар
- Інтерактивний календар на основі react-big-calendar
- Перегляд зустрічей у режимах: місяць, тиждень, день, порядок денний
- Кольорове кодування подій
- Підтримка української локалізації

### 🏢 Проекти
- Список всіх проектів компанії
- Статуси: планування, в процесі, завершено, призупинено
- Пріоритети: низький, середній, високий
- Відображення учасників проекту
- Терміни виконання

### 👥 Працівники
- Список всіх працівників компанії
- Групування за відділами
- Відображення завантаженості працівників (0-100%)
- Перегляд проектів та зустрічей кожного працівника
- Візуальні індикатори рівня навантаження

### 📧 Запрошення
- Перегляд запрошень до проектів та зустрічей
- Статуси: очікує, прийнято, відхилено
- Можливість прийняти або відхилити запрошення

## 🛠️ Технології

- **Next.js 14** - React фреймворк з App Router
- **TypeScript** - Типізація
- **Tailwind CSS** - Стилізація
- **react-big-calendar** - Календар
- **moment.js** - Робота з датами
- **lucide-react** - Іконки

## 📦 Встановлення та запуск

```bash
# Клонувати репозиторій
git clone https://github.com/DaikinAdmin/AMM-business-calendar.git

# Перейти до директорії
cd AMM-business-calendar

# Встановити залежності
npm install

# Запустити dev сервер
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
