function handler () {
  VERSION=`/opt/awscli/aws --version`
  echo "{\"Data\": {\"Version\": \"$VERSION\"}}"
}