serve site:
	poetry run mkdocs serve --watch-theme -f {{site}}.yml

build:
	poetry run mkdocs build

publish: build
	rsync -a --delete -e "ssh" site/* github@evokewonder.com:/var/www/acrl/.
