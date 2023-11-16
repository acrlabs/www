.PHONY: build publish serve

serve:
	poetry run mkdocs serve --watch-theme

build:
	poetry run mkdocs build

publish: build
	rsync -a --delete -e "ssh" site/* github@evokewonder.com:/var/www/acrl/.
