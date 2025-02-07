import logging

log = logging.getLogger(f"mkdocs.plugins.{__name__}")


def on_page_markdown(markdown, page, files, config):
    if page.file.src_uri != "index.md":
        return markdown

    log.info(f"substituting changelog contents in {page.title}")
    changelog = files.get_file_from_path("simkube/CHANGELOG.md")
    cl_contents = ""
    start = False
    for line in changelog.content_string.split("\n"):
        if line.startswith("## "):
            if not start:
                start = True
            else:
                break

        if start:
            cl_contents += line + "\n"

    output = ""
    for line in markdown.split("\n"):
        if "INSERT CHANGELOG" in line:
            output += cl_contents
        else:
            output += line + "\n"

    return output
