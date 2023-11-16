COMMENT_OPEN = "<!--\n"
COMMENT_CLOSE = "-->\n"
YAML_META_TAG = "---\n"

# Replace HTML comment markers at the beginning of the file
# with YAML metadata tags, e.g., 
#
#   <!--
#   foo: bar
#   -->
#
# will become
#
#   ---
#   foo: bar
#   ---
#
# The opening lines must match EXACTLY, e.g., no white space at the end.
def on_page_read_source(page, config):
    print(page.file.abs_src_path)
    with open(page.file.abs_src_path) as f:
        lines = f.readlines()
        if lines[0] == COMMENT_OPEN:
            lines[0] = YAML_META_TAG
            close_index = lines.index(COMMENT_CLOSE)
            lines[close_index] = YAML_META_TAG
        return ''.join(lines)
