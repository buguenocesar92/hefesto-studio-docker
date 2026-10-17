FROM node:24-alpine
WORKDIR /app/portable
COPY portable/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node portable/ ./
COPY --chown=node:node content/ /app/content/
COPY --chown=node:node dist/ /app/dist/
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
