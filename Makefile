.PHONY: build publish

build:
	mkdocs build

publish: build
	rsync -a --delete -e "ssh -v" site/* github@evokewonder.com:/var/www/acrl/.
