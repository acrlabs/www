serve site:
	poetry run mkdocs serve --watch-theme -f {{site}}.yml

build site:
	poetry run mkdocs build -f {{site}}.yml
