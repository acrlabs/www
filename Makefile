.PHONY: build publish serve

serve:
	mkdocs serve --watch-theme

build:
	mkdocs build

publish: build
	rsync -a --delete -e "ssh -v" site/* github@evokewonder.com:/var/www/acrl/.
