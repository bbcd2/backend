export enum Status {
  "Initialising" = 1,
  "Downloading" = 2,
  "Encoding" = 3,
  "Uploading Result" = 4,
  "Complete" = 5,
}

interface SourceEntry {
  name: string;
  urlPrefix: string;
}
// prettier-ignore
export const sources: SourceEntry[] = [
  {name: "BBC NEWS CHANNEL HD", urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_news_channel_hd/"},
  {name: "BBC WORLD NEWS AMERICA HD", urlPrefix: "https://vs-cmaf-pushb-ntham-gcomm-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_world_news_north_america/"},
  {name: "BBC ONE HD", urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_hd/"},
  {name: "BBC ONE WALES HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_wales_hd/"},
  {name: "BBC ONE SCOTLAND HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_scotland_hd/"},
  {name: "BBC ONE NORTHERN IRELAND HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_northern_ireland_hd/"},
  {name: "BBC ONE CHANNEL ISLANDS HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_channel_islands/"},
  {name: "BBC ONE EAST HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_east/"},
  {name: "BBC ONE EAST MIDLANDS HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_east_midlands/"},
  {name: "BBC ONE EAST YORKSHIRE & LINCONSHIRE HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_east_yorkshire/"},
  {name: "BBC ONE LONDON HD", urlPrefix: "https://vs-cmaf-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_london/"},
  {name: "BBC ONE NORTH EAST HD", urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_north_east/"},
  {name: "BBC ONE NORTH WEST HD", urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_north_west/"},
  {name: "BBC ONE SOUTH HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_south/"},
  {name: "BBC ONE SOUTH EAST HD", urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_south_east/"},
  {name: "BBC ONE SOUTH WEST HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_south_west/"},
  {name: "BBC ONE WEST HD", urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_west/"},
  {name: "BBC ONE WEST MIDLANDS HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_west_midlands/"},
  {name: "BBC ONE YOKRSHIRE HD", urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_yorks/"},
  {name: "BBC TWO HD", urlPrefix: "https://vs-cmaf-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_two_hd/"},
  {name: "BBC TWO NORTHERN IRELAND HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_two_northern_ireland_hd/"},
  {name: "BBC TWO WALES DIGITAL", urlPrefix: "https://vs-cmaf-pushb-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_two_wales_digital/"},
  {name: "BBC THREE HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_three_hd/"},
  {name: "BBC FOUR HD", urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_four_hd/"},
  {name: "CBBC HD", urlPrefix: "https://b2-hobir-sky.live.bidi.net.uk/vs-cmaf-pushb-uk/x=4/i=urn:bbc:pips:service:cbbc_hd/"},
  {name: "CBEEBIES HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:cbeebies_hd/"},
  {name: "BBC SCOTLAND HD", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_scotland_hd/"},
  {name: "BBC PARLIAMENT", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_parliament/"},
  {name: "BBC ALBA", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_alba/"},
  {name: "S4C", urlPrefix: "https://vs-cmaf-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:s4cpbs/"},
];
