export class DateUtility {
    public static parseDate(dateString: string): Date {
        if (typeof dateString !== 'string') {
            return null;
        }
        const mostCases = dateString.match(/^(\d{4})\D(\d{2})\D(\d{2})(\D(\d{2})\D(\d{2})\D(\d{2}))?/);
        if (mostCases) {
            const dateInFormat = mostCases[1]
                + '/' + mostCases[2]
                + '/' + mostCases[3]
                + ' ' + (mostCases[5] ? mostCases[5] : '00')
                + ':' + (mostCases[6] ? mostCases[6] : '00')
                + ':' + (mostCases[7] ? mostCases[7] : '00');
            return new Date(dateInFormat);
        }
        return new Date(dateString);
    }
}
