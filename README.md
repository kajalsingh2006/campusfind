# CampusFind — College Lost & Found Portal

CampusFind is a full-stack college lost-and-found web application built with HTML, CSS, vanilla JavaScript, Node.js, Express.js and MongoDB.

## Included features

- Public home page and approved item browsing/search
- User registration and login (bcrypt password hashing, JWT sessions)
- User dashboard, profile, own reports and claims
- Lost/found report submission with optional image upload
- Admin dashboard, user management, report approval/rejection, claim approval/rejection and category management
- Responsive desktop/tablet/mobile layout

## Requirements to install

1. **Node.js LTS** — https://nodejs.org/ (install the LTS version)
2. **Visual Studio Code** — https://code.visualstudio.com/
3. **MongoDB Community Server** — https://www.mongodb.com/try/download/community  
   OR create a free MongoDB Atlas cluster — https://www.mongodb.com/cloud/atlas

You do not need XAMPP. This project uses Node.js/Express, not PHP.

## Start with local MongoDB

1. Install Node.js LTS and MongoDB Community Server.
2. Open this `CampusFind` folder in VS Code.
3. Open Terminal → New Terminal.
4. Install packages:

   ```bash
   npm install
   ```

5. Copy `.env.example` and rename the copy to `.env`.
6. Keep the local database setting:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/campusfind
   ```

   Replace `JWT_SECRET` with a long random secret. Change the admin password before creating the admin account.

7. Make sure the MongoDB service is running.
8. Create the admin account and default categories:

   ```bash
   npm run seed:admin
   ```

9. Start the website:

   ```bash
   npm run dev
   ```

10. Open **http://localhost:5000** in Chrome.

## Admin login

The starter `.env.example` contains these initial values:

- Email: `admin@campusfind.local`
- Password: `ChangeMe123!`

These values are only starter credentials. Change `ADMIN_PASSWORD` in `.env` before running `npm run seed:admin`. Never deploy the example password publicly.

## Using MongoDB Atlas instead

1. Create an Atlas account and a free cluster.
2. Create a database user and password.
3. Add your current IP address to Atlas Network Access.
4. Choose Connect → Drivers → Node.js and copy the connection string.
5. Paste it into `.env` as `MONGODB_URI`. Replace `<password>` with the database user's password and include `/campusfind` before query parameters.
6. Run `npm run seed:admin`, then `npm run dev`.

Keep `.env` private; do not upload it to GitHub or share it.

## Useful commands

```bash
npm install       # install dependencies
npm run seed:admin # create/update admin and seed categories
npm run dev       # development server (auto restart)
npm start         # normal server
```

## Notes / current project scope

- Reports are private to their owner until an admin approves them.
- Only approved reports appear in public browse/search.
- Claims can currently be submitted for **found** items; the admin reviews them.
- Approving a claim marks the item as returned.
- Images are saved locally in `public/uploads`. For production hosting, use persistent file storage or an object-storage service.
- This is a student project starter, not a production-hardened service. Before public deployment, add email verification, password reset, stronger audit logging, CSRF strategy if switching to cookies, image scanning, backups, pagination, and a proper claim handover process.
- The starter admin dashboard uses real database counts, not sample numbers.
