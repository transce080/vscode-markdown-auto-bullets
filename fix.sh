git filter-branch --env-filter '
if [ "$GIT_COMMITTER_EMAIL" = "jason.lonsberry@parkplacetech.com" ]; then
    export GIT_COMMITTER_NAME="Jason Lonsberry"
    export GIT_COMMITTER_EMAIL="33551248+transce080@users.noreply.github.com"
fi
if [ "$GIT_AUTHOR_EMAIL" = "jason.lonsberry@parkplacetech.com" ]; then
    export GIT_AUTHOR_NAME="Jason Lonsberry"
    export GIT_AUTHOR_EMAIL="33551248+transce080@users.noreply.github.com"
fi
' --tag-name-filter cat -- --branches --tags
