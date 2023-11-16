import re

def regex_replace(s, find, replace):
    return re.sub(find, replace, s)

def on_env(env, config, files):
    env.filters["regex_replace"] = regex_replace
