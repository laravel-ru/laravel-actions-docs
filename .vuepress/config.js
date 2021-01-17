module.exports = {
    title: 'Laravel Actions',
    description: 'Запускайте свои простые классы PHP как угодно.',
    head: [
        ['link', { rel: 'icon', href: '/logo_icon.png' }],
    ],
    themeConfig: {
        logo: '/logo_icon.png',
        lastUpdated: 'Последнее обновление',
        repo: 'lorisleiva/laravel-actions',
        repoLabel: 'GitHub',
        docsRepo: 'laravel-ru/laravel-actions-docs',
        docsBranch: 'main-ru',
        editLinks: true,
        editLinkText: 'Редактировать эту страницу',
        nav: [
            {
                text: 'Версия',
                items: [
                    { text: '2.x', link: '/' },
                    { text: '1.x', link: '/1.x/' }
                ]
            },
        ],
        sidebar: {
            '/1.x/': [
                {
                    title: 'Getting Started',
                    collapsable: false,
                    children: [
                        ['/1.x/', 'Introduction'],
                        '/1.x/installation',
                        '/1.x/basic-usage',
                        '/1.x/actions-attributes',
                        '/1.x/dependency-injections',
                        '/1.x/authorisation',
                        '/1.x/validation',
                    ],
                },
                {
                    title: 'Actions as...',
                    collapsable: false,
                    children: [
                        '/1.x/actions-as-objects',
                        '/1.x/actions-as-jobs',
                        '/1.x/actions-as-listeners',
                        '/1.x/actions-as-controllers',
                        '/1.x/actions-as-commands',
                    ],
                },
                {
                    title: 'Advanced',
                    collapsable: false,
                    children: [
                        '/1.x/registering-actions',
                        '/1.x/action-running-as',
                        '/1.x/nested-actions',
                        '/1.x/action-lifecycle',
                    ],
                },
            ],
            '/': [
                {
                    title: 'Начало работы',
                    collapsable: false,
                    children: [
                        ['/', 'Введение'],
                        '/2.x/installation',
                        '/2.x/basic-usage',
                        '/2.x/upgrade',
                    ],
                },
                {
                    title: 'Учитесь на примерах',
                    collapsable: false,
                    children: [
                        '/2.x/examples/generate-reservation-code',
                        '/2.x/examples/get-user-profile',
                        '/2.x/examples/create-new-article',
                        '/2.x/examples/export-user-data',
                        '/2.x/examples/demote-team-membership',
                        '/2.x/examples/synchronize-contacts-from-google',
                    ],
                },
                {
                    title: 'Руководство',
                    collapsable: false,
                    children: [
                        '/2.x/one-class-one-task',
                        '/2.x/register-as-controller',
                        '/2.x/add-validation-to-controllers',
                        '/2.x/dispatch-jobs',
                        '/2.x/listen-for-events',
                        '/2.x/execute-as-commands',
                        '/2.x/mock-and-test',
                        '/2.x/granular-traits',
                        '/2.x/how-does-it-work',
                    ],
                },
                {
                    title: 'Ссылки',
                    collapsable: false,
                    children: [
                        '/2.x/as-object',
                        '/2.x/as-controller',
                        '/2.x/as-job',
                        '/2.x/as-listener',
                        '/2.x/as-command',
                        '/2.x/as-fake',
                    ],
                },
            ]
        },
    },
    domain: 'https://actions.getlaravel.ru/',
    plugins: {
        'seo': {
            type: _ => 'website',
            description: (_, $site) => $site.description,
            image: (_, $site) => $site.domain + 'hero2-social.jpg',
        },
        '@vuepress/search': {
            searchMaxSuggestions: 6,
            test: '/2\.x/',
        },
        'google-gtag': {
            ga: 'G-0RS0H38JHZ',
        },
    },
}
