Refonte (WIP) du site nosdeputes.fr en Next.js

Actuellement déployé sur https://nosdeputes-releve-front.vercel.app/ _C'est un setup minimal. La DB est installée manuellement sur un petit serveur pas cher. Stabilité/performance non garanties_

# Roadmap / objectifs

- L'idée de faire une version vraiment iso de nosdeputes.fr et de réutiliser leur base de données a été abandonnée
- L'objectif maintenant est plus libre et plus flou : faire un site d'information sur les députés / l'AN
- On ne sait pas quelles données seront affichées et comment. On explore les données, on affiche ce qu'il en sort, et on ajuste au fur et mesure
- On ne sait pas si ce nouveau site prendra la place de www.nosdeputes.fr. Ce sera à négocier avec Regards Citoyens au fur et mesure que le projet prend forme
- On sait qu'on veut reprendre telle quelles les URLs des députés et des circonscriptions, pour ne pas perturber trop le SEO. Le reste, on peut faire ce qu'on veut.
- Cette app utilise exclusivement la DB préparée par https://github.com/regardscitoyens/NosDeputes2-data/tree/main/releve_db_cli (c'est-à-dire, pour l'instant, qu'on se base quasi uniquement sur l'open data de l'AN). **Ces deux repos sont donc fortement couplés**
- Contrairement au site www.nosdeputes.fr, dans celui-ci toutes les législatures sont sur le même site.

# Stack

- Next.js
- Typescript
- Kysely pour les requêtes SQL
- Tailwind pour le CSS

## Details techniques

Les pages ont été codées suivant une structure modulaire (cf le dossier `/src/pageModules`). C'est fait maison mais assez intuitif je pense.

Le dossier `/pages` ne sert qu'à faire le routing vers les `/pageModules`, ou pour les pages qui resteront vraiment simples (contenu statique).

# Installation / faire tourner en local

Il faut Yarn et NodeJS.

## DB Postgres

Il faut une DB postgres.
Il faut utiliser le projet https://github.com/regardscitoyens/NosDeputes2-data/tree/main/releve_db_cli pour créer les tables dans cette DB et l'alimenter.

## Lancer le frontend

Enfin il faut créér un fichier .env.local en se basant sur le .env.local.sample

Quand tout est prêt :

    # installer les dépendances
    yarn
    # lancer
    yarn dev
    # puis aller sur http://localhost:3000

# Contribuer

Vous êtes le bienvenu. La TODO list des choses à faire est ici https://pad.regardscitoyens.org/p/todo_dev

N'hésitez pas à faire signe si vous commencez à bosser sur un truc, pour qu'on ne fasse pas deux fois la même chose

# Si vous avez une vision différente pour nosdeputes.fr

Si l'un de vous a quelque chose de vraiment différent en tête, vous pouvez démarrer votre propre version dans un autre repo ou une autre branche. Ou vous pouvez contribuer à ce repo pendant un moment et le forker dès que ça vous arrange pour en faire quelque chose de différent. Pas de souci.
