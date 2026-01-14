# Database Knowledge

## When to Load
Keywords: database, db, schema, migration, query, sql, orm, postgres, supabase, prisma

---

## Schema Design Principles

### Naming Conventions
```sql
-- Tables: plural, snake_case
CREATE TABLE users (...);
CREATE TABLE order_items (...);

-- Columns: snake_case
user_id, created_at, is_active

-- Primary keys: id (UUID or serial)
-- Foreign keys: table_singular_id
user_id REFERENCES users(id)
```

### Standard Columns
```sql
-- Every table should have:
id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at  TIMESTAMPTZ DEFAULT NOW(),
updated_at  TIMESTAMPTZ DEFAULT NOW()

-- For soft delete:
deleted_at  TIMESTAMPTZ
```

### Indexes
```sql
-- Always index:
-- 1. Foreign keys
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 2. Columns used in WHERE clauses
CREATE INDEX idx_users_email ON users(email);

-- 3. Columns used in ORDER BY
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

---

## Migration Best Practices

### Reversible Migrations
```sql
-- UP
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- DOWN
ALTER TABLE users DROP COLUMN phone;
```

### Safe Column Changes
```sql
-- Adding column: Safe
ALTER TABLE users ADD COLUMN bio TEXT;

-- Dropping column: Dangerous, do in steps
-- 1. Stop writing to column
-- 2. Deploy code that doesn't read it
-- 3. Drop column in next release
```

### Data Migrations
```sql
-- Never mix schema and data migrations
-- Do data backfill in separate migration
UPDATE users SET phone_verified = true WHERE phone IS NOT NULL;
```

---

## Query Patterns

### Avoid N+1
```typescript
// BAD: N+1 queries
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  user.orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [user.id]);
}

// GOOD: Single query with JOIN or IN
const users = await db.query(`
  SELECT u.*, json_agg(o.*) as orders
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  GROUP BY u.id
`);
```

### Parameterized Queries
```typescript
// BAD: SQL injection risk
const query = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD: Parameterized
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);
```

### Pagination
```sql
-- Offset pagination (simple but slow on large tables)
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 40;

-- Cursor pagination (better for large tables)
SELECT * FROM posts 
WHERE created_at < $1 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## Supabase Patterns

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own posts
CREATE POLICY "Users see own posts" ON posts
FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own posts
CREATE POLICY "Users insert own posts" ON posts
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Real-time Subscriptions
```typescript
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe();
```

---

## Prisma Patterns

### Schema Definition
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}
```

### Transactions
```typescript
await prisma.$transaction([
  prisma.post.create({ data: postData }),
  prisma.user.update({ where: { id }, data: { postCount: { increment: 1 } } }),
]);
```

---

## Checklist

- [ ] All tables have id, created_at, updated_at
- [ ] Foreign keys have indexes
- [ ] Migrations are reversible
- [ ] No raw string interpolation in queries
- [ ] N+1 queries avoided
- [ ] Appropriate indexes for query patterns
- [ ] RLS enabled for multi-tenant data
