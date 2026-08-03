# Database

Database

PostgreSQL

ORM

Prisma

---

Naming Rules

snake_case in database

camelCase in TypeScript

UUID primary keys

created_at

updated_at

deleted_at (soft delete where needed)

---

Relationships

User

↓

Folder

↓

Link

↓

Analytics

↓

QRCode

↓

Custom Domain

---

Tables

Users

Folders

Links

Clicks

Tags

LinkTags

Favorites

Sessions

Accounts

Verification

CustomDomains

QRCode

UTMTemplates

---

Indexes

slug

user_id

folder_id

created_at

country

device

---

Cascade Rules

Deleting a user should delete:

Links

Folders

Analytics

Favorites

etc.

---

Analytics Strategy

One click = one analytics event.

Store:

IP hash

Country

City

Browser

OS

Device

Referrer

Timestamp

---

Future Tables

Products

Orders

Subscriptions

Teams

Invitations

AI History

Campaigns

Emails

Payments