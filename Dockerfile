FROM node:22-alpine AS production-dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json tsconfig.json ./

# Nguồn cần cho các lệnh vận hành chạy ngay trong container:
#   npm run db:deploy      -> db/schema.prisma + db/migrations
#   npm run db:seed        -> db/seed.ts (import ../src/data)
#   npm run legacy:import  -> scripts/legacy/*
# (prisma CLI và tsx nằm ở dependencies chứ không phải devDependencies vì lý do này.)
COPY --from=build /app/db ./db
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src ./src

# Thư mục dữ liệu lúc chạy. Deploy mount thư mục của host đè lên đây và chạy
# container bằng đúng uid/gid đang sở hữu thư mục đó (xem deploy.yml), nên không
# phụ thuộc vào việc host có user mang uid 1000 hay không.
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/server.cjs"]
