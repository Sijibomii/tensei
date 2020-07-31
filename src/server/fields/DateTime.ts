import DateField from './Date'

export class DateTime extends DateField {
    /**
     *
     * This would match the knex method name
     * on the create builder.
     */
    protected sqlDatabaseFieldType: string = 'datetime'

    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'DateTimeField'
}

export default DateTime