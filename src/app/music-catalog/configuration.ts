export class Configuration {
    public static API_BASE_DOMAIN = '/music-catalog-api';
    public static APPLICATION_TITLE = 'Sutton Music Catalog';
    public static SHOW_IMAGES = true;
    public static IMAGE_PATH = 'assets/img/';
    // wait time in number of days for re-try, after trying to get a URL for the artwork
    public static IMAGE_FETCH_INTERVAL = 30;
    public static API_THROTTLE_TIME = 500;
}
