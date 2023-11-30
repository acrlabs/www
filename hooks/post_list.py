from mkdocs.structure.nav import Navigation
from mkdocs.structure.nav import Section
from mkdocs.structure.pages import Page

def on_nav(nav, config, files):
    print('calling on nav')
    post_pages = [
        Page(None, f, config)
        for f in sorted(files, key=lambda f: f.src_uri, reverse=True)
        if f.src_uri.startswith("posts/")
    ]
    nav.items.append(Section("PostList", post_pages))
    nav.pages.append(post_pages)
    return nav
