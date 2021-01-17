out=".vuepress/dist"
docs="_gh_pages"
ghPagesBranch="gh-pages"
site="actions.getlaravel.ru"

echo "Deleting old publication"
rm -rf $out
rm -rf $docs
mkdir $docs
git worktree prune
rm -rf .git/worktrees/$docs/

echo "Checking out gh-pages branch into _gh_pages"
git worktree add -B $ghPagesBranch $docs origin/$ghPagesBranch

echo "Removing existing files"
rm -rf $docs/*

echo "Generating site"
npm run docs:build
cp $out/* $docs/ -r
echo $site >> $docs/CNAME
touch $docs/.nojekyll

echo "Updating gh-pages branch"

read -p "Enter message for commit: " answer

if [[ $answer ]]
then
message=$answer
else
message="Update docs"
fi

cd $docs && git add --all && git commit -m "$message" && git push origin $ghPagesBranch && cd ..

#echo "Pushing to github"
#git push --all
