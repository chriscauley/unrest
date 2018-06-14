cd src/vendor
for url in `cat _vendor_urls`;
do
    wget $url;
done