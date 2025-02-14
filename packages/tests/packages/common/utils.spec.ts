import Faker from 'faker'
import { Utils } from '@tensei/common'
import { paramCase } from 'change-case'
import { setup, fakePost, fakeUser } from './setup'

test('correctly gets validation rules for a resource', async () => {
    const {
        ctx: {
            orm: { em, config },
            resourcesMap
        }
    } = await setup()
    const validator = Utils.validator(resourcesMap['Post'], em, resourcesMap)
    const commentValidator = Utils.validator(
        resourcesMap['Comment'],
        em,
        resourcesMap
    )

    const isMongo = config.get('type') === 'mongo'

    expect(validator.getValidationRules()).toEqual({
        title: 'required|max:64|unique:title',
        description: 'required',
        content: 'required|max:2000|min:12',
        av_cpc: 'required',
        category: 'required',
        user: 'required',
        published_at: 'date|required',
        approved: 'boolean',
        scheduled_for: 'date|required',
        tags: 'array',
        'tags.*': isMongo ? 'string' : 'number',
        comments: 'array',
        'comments.*': isMongo ? 'string' : 'number'
    })

    expect(commentValidator.getValidationRules()).toEqual({
        title: 'required',
        body: 'required',
        post: isMongo ? 'string' : 'number'
    })
})

test('Sanitizes resource fields on create', async () => {
    const {
        ctx: {
            orm: { em, config },
            resourcesMap
        }
    } = await setup()
    const isMongo = config.get('type') === 'mongo'

    const validator = Utils.validator(resourcesMap['Comment'], em, resourcesMap)

    expect(validator.getValidationRules()).toEqual({
        title: 'required',
        body: 'required',
        post: isMongo ? 'string' : 'number'
    })

    const validPayload = {
        title: Faker.lorem.sentence(),
        body: Faker.lorem.sentence(),
        post: isMongo ? Faker.random.word() : Faker.random.number()
    }

    expect(await validator.validate(validPayload)).toEqual([
        true,
        {
            ...validPayload,
            title: paramCase(validPayload.title)
        }
    ])
})

test('correctly validates data and throws error with validation rules', async () => {
    const {
        ctx: { orm, resourcesMap }
    } = await setup()
    const { em } = orm
    const validator = Utils.validator(resourcesMap['Post'], em, resourcesMap)

    const fakePostPayload = {
        ...fakePost(),
        title: Faker.lorem.word()
    }
    const fakeUserPayload = fakeUser()

    await em.persistAndFlush(em.create('User', fakeUserPayload))

    await em.persistAndFlush(
        em.create('Post', {
            ...fakePostPayload,
            user: ((await em.findOne('User', {
                email: fakeUserPayload.email
            })) as any).id
        })
    )

    const payload = {
        tags: [1, 2, 3, 4, 'INVALID_TAG_ID_VALUE'],
        av_cpc: Faker.random.number(),
        title: fakePostPayload.title,
        something_not_supposed_to_be_here: 'something_not_supposed_to_be_here'
    }

    const tags_validations =
        orm.config.get('type') === 'mongo'
            ? [
                  {
                      message: 'string validation failed on tags.0',
                      validation: 'string',
                      field: 'tags.0'
                  },
                  {
                      message: 'string validation failed on tags.1',
                      validation: 'string',
                      field: 'tags.1'
                  },
                  {
                      message: 'string validation failed on tags.2',
                      validation: 'string',
                      field: 'tags.2'
                  },
                  {
                      message: 'string validation failed on tags.3',
                      validation: 'string',
                      field: 'tags.3'
                  }
              ]
            : [
                  {
                      field: 'tags.4',
                      message: 'number validation failed on tags.4',
                      validation: 'number'
                  }
              ]

    expect(await validator.validate(payload)).toEqual([
        false,
        [
            {
                message: 'This title has already been taked.',
                validation: 'unique',
                field: 'title'
            },
            {
                field: 'description',
                message: 'The description is required.',
                validation: 'required'
            },
            {
                field: 'content',
                message: 'The content is required.',
                validation: 'required'
            },
            {
                field: 'category',
                message: 'The category is required.',
                validation: 'required'
            },
            {
                field: 'user',
                message: 'The user is required.',
                validation: 'required'
            },
            {
                field: 'published_at',
                message: 'The published_at is required.',
                validation: 'required'
            },
            {
                field: 'scheduled_for',
                message: 'The scheduled_for is required.',
                validation: 'required'
            },
            ...tags_validations
        ]
    ])

    const createdPost: any = await em.findOne('Post', {
        title: fakePostPayload.title
    })

    const updateValidator = Utils.validator(
        resourcesMap['Post'],
        em,
        resourcesMap,
        createdPost.id
    )

    expect(await updateValidator.validate(payload, false)).toEqual([
        false,
        [
            {
                field: 'description',
                message: 'The description is required.',
                validation: 'required'
            },
            {
                field: 'content',
                message: 'The content is required.',
                validation: 'required'
            },
            {
                field: 'category',
                message: 'The category is required.',
                validation: 'required'
            },
            {
                field: 'user',
                message: 'The user is required.',
                validation: 'required'
            },
            {
                field: 'published_at',
                message: 'The published_at is required.',
                validation: 'required'
            },
            {
                field: 'scheduled_for',
                message: 'The scheduled_for is required.',
                validation: 'required'
            },
            ...tags_validations
        ]
    ])
})
