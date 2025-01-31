serve site:
	poetry run mkdocs serve --watch-theme -f {{site}}.yml

build site:
	poetry run mkdocs build -f {{site}}.yml

publish site: (build site)
    rsync -a --delete -e "ssh" site/* github@evokewonder.com:/var/www/{{site}}/.

publish-next site: (build site)
    rsync -a --delete -e "ssh" site/{{site}}/* github@evokewonder.com:/var/www/{{site}}/next/.
