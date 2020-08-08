const {
    dateTime,
    integer,
    text,
    textarea,
    date,
    belongsTo,
    select,
    resource,
} = require('@flamingo/core')

module.exports = resource('Post')
    .displayInNavigation()
    .fields([
        text('Title')
            .sortable()
            .searchable().unique().rules('required', 'max:24'),
        text('Description').rules('required'),
        textarea('Content').rules('required', 'max:200', 'min:12'),
        integer('Av. CPC').rules('required'),
        select('Category').options([
            {
                label: 'Javascript',
                value: 'javascript',
            },
            {
                label: 'Angular',
                value: 'angular',
            },
            {
                label: 'Mysql',
                value: 'mysql',
            },
            {
                label: 'Postgresql',
                value: 'pg',
            },
        ]).rules('required'),
        belongsTo('User').notNullable().searchable().rules('required'),
        date('Published At').notNullable().firstDayOfWeek(4).rules('required', 'date'),
        dateTime('Scheduled For').rules('required', 'date'),
    ])
    .perPageOptions([25, 50, 100])
    .displayField('title')
