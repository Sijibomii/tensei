import DateField from './Date'

export class Timestamp extends DateField {
    /**
     *
     * This would match the knex method name
     * on the create builder.
     */
    public databaseFieldType: string = 'timestamp'

    /**
     *
     * This is a short name for the frontend component that
     * will be mounted for this field.
     */
    public component = 'TimestampField'
}

export const timestamp = (name: string, databaseField?: string) =>
    new Timestamp(name, databaseField)

export default Timestamp
