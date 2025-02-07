import logging

from mkdocs.structure.nav import Section
from mkdocs.structure.pages import Page

log = logging.getLogger(f"mkdocs.plugins.{__name__}")


def on_nav(nav, config, files):
    log.info("Generating post list")
    post_pages = [
        Page(None, f, config)
        for f in sorted(files, key=lambda f: f.src_uri, reverse=True)
        if f.src_uri.startswith("posts/")
    ]
    nav.items.append(Section("PostList", post_pages))
    nav.pages.append(post_pages)
    return nav
