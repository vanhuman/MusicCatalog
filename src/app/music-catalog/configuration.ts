export class Configuration {
    public static API_BASE_DOMAIN = '/music-catalog-api';
    public static APPLICATION_TITLE = 'Sutton Music Catalog';
    public static ICONS_PATH = 'assets/icons/';
    public static IMAGE_FETCH_INTERVAL = 30; // wait time in number of days for re-try, after trying to get a URL for the artwork
    public static SHOW_IMAGES = true;
    public static IMAGE_FULL_PATH = '/artwork/full/';
    public static IMAGE_THUMB_PATH = '/artwork/thumb/';
    public static API_THROTTLE_TIME = 500;
    public static PAGE_SIZE = 100;
    public static IMAGE_THUMB_DEFAULT = 'assets/icons/transparant.png';
}
