# Backlog & notes techniques

Elements à traiter, notés au fil des conversations.

---

## Données & migration

- [ ] **Migration SQLite → PostgreSQL** : prévoir un script one-shot de migration de données (`sqlite_to_pg.py`) quand le projet sera assez mature. Alembic gère déjà le schéma. Conserver une vision AWS/Azure-compatible (pas de lock-in).
- [ ] **Export/import DB** : mécanisme pour exporter/importer toute la base (JSON ou SQL dump) — utile pour les migrations entre versions et entre instances. Envisager un script CLI plutôt qu'un endpoint HTTP.
- [ ] **Import CSV utilisateur** : permettre l'import d'historique (poids, médicaments, événements) via CSV. Format à définir, avec validation et dédoublonnage. Commencer par le poids : `date,poids,unité,notes`.
