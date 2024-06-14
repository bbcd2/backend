export enum Status {
  // OK statuses
  "Initialising" = 1,
  "Downloading" = 2,
  "Combining" = 3,
  "Encoding" = 4,
  "Uploading Result" = 5,
  "Complete" = 6,
  /** Separation between OK statuses and error statuses */
  "_SENTINEL_MAX_OK" = 7,
  // Error statuses
  "Downloading Failed" = 10,
  "Combining Failed" = 11,
  "Encoding Failed" = 12,
  "Uploading Failed" = 13,
}

interface SourceEntry {
  id: number;
  urlPrefix: string;
}
// prettier-ignore
export const SOURCES: {[key:string]: SourceEntry} = {
  "BBC NEWS CHANNEL HD": {id: 0, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_news_channel_hd/"},
  "BBC WORLD NEWS AMERICA HD": {id: 1, urlPrefix: "https://vs-cmaf-pushb-ntham-gcomm-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_world_news_north_america/"},
  "BBC ONE HD": {id: 2, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_hd/"},
  "BBC ONE WALES HD": {id: 3, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_wales_hd/"},
  "BBC ONE SCOTLAND HD": {id: 4, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_scotland_hd/"},
  "BBC ONE NORTHERN IRELAND HD": {id: 5, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_northern_ireland_hd/"},
  "BBC ONE CHANNEL ISLANDS HD": {id: 6, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_channel_islands/"},
  "BBC ONE EAST HD": {id: 7, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_east/"},
  "BBC ONE EAST MIDLANDS HD": {id: 8, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_east_midlands/"},
  "BBC ONE EAST YORKSHIRE & LINCONSHIRE HD": {id: 9, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_east_yorkshire/"},
  "BBC ONE LONDON HD": {id: 10, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_london/"},
  "BBC ONE NORTH EAST HD": {id: 11, urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_north_east/"},
  "BBC ONE NORTH WEST HD": {id: 12, urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_north_west/"},
  "BBC ONE SOUTH HD": {id: 13, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_south/"},
  "BBC ONE SOUTH EAST HD": {id: 14, urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_south_east/"},
  "BBC ONE SOUTH WEST HD": {id: 15, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_south_west/"},
  "BBC ONE WEST HD": {id: 16, urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_west/"},
  "BBC ONE WEST MIDLANDS HD": {id: 17, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_west_midlands/"},
  "BBC ONE YORKSHIRE HD": {id: 18, urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_one_yorks/"},
  "BBC TWO HD": {id: 19, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_two_hd/"},
  "BBC TWO NORTHERN IRELAND HD": {id: 20, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_two_northern_ireland_hd/"},
  "BBC TWO WALES DIGITAL": {id: 21, urlPrefix: "https://vs-cmaf-pushb-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_two_wales_digital/"},
  "BBC THREE HD": {id: 22, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_three_hd/"},
  "BBC FOUR HD": {id: 23, urlPrefix: "https://vs-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_four_hd/"},
  "CBBC HD": {id: 24, urlPrefix: "https://b2-hobir-sky.live.bidi.net.uk/vs-cmaf-pushb-uk/x=4/i=urn:bbc:pips:service:cbbc_hd/"},
  "CBEEBIES HD": {id: 25, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:cbeebies_hd/"},
  "BBC SCOTLAND HD": {id: 26, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_scotland_hd/"},
  "BBC PARLIAMENT": {id: 27, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_parliament/"},
  "BBC ALBA": {id: 28, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:bbc_alba/"},
  "S4C": {id: 29, urlPrefix: "https://vs-cmaf-push-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:s4cpbs/"},
  "BBC STREAM 51 HD": {id: 30, urlPrefix: "https://ve-cmaf-pushb-uk.live.cf.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:ww_bbc_stream_051/" },
  "BBC STREAM 52 HD": {id: 31, urlPrefix: "https://ve-cmaf-pushb-uk.live.fastly.md.bbci.co.uk/x=4/i=urn:bbc:pips:service:uk_bbc_stream_052/" }
}
