# Зарегистрируйте свою задачу как контроллер

## Регистрация маршрута

Чтобы запустить действие в качестве контроллера, Вам просто нужно зарегистрировать его в файле маршрутов, как и любой другой вызываемый контроллер.

```php
Route::post('/users/{user}/articles', CreateNewArticle::class);
```

## От контроллера к действию

Поскольку у Вас есть полный контроль над реализацией Ваших экшенов, Вам необходимо преобразовать полученный запрос в вызов Вашего метода `handle`.

Вы можете использовать метод `asController` для определения этой логики. Его параметры будут разрешены с использованием привязки модели маршрута, как это было бы в контроллере.

```php
class CreateNewArticle
{
    use AsAction;

    public function handle(User $user, string $title, string $body): Article
    {
        return $user->articles()->create(compact('title', 'body'));
    }

    public function asController(User $user, Request $request): Response
    {
        $article = $this->handle(
            $user,
            $request->get('title'),
            $request->get('body')
        );

        return redirect()->route('articles.show', [$article]);
    }
}
```

Если Вы планируете использовать свой экшен только в качестве контроллера, Вы можете опустить метод `asController` и использовать метод `handle` непосредственно в качестве вызываемого контроллера.

```php
class CreateNewArticle
{
    use AsAction;

    public function handle(User $user, Request $request): Response
    {
        $article = $user->articles()->create(
            $request->only('title', 'body')
        )

        return redirect()->route('articles.show', [$article]);
    }
}
```

Обратите внимание, что в этом примере Вы теряете возможность запускать `CreateNewArticle::run($user, 'My title', 'My content')`.

## Назначение мидлвара контроллера

Вместо или в дополнение к определению Вашего мидлвара в Вашем файле маршрутов Вы также можете определить их непосредственно в действии, используя метод `getControllerMiddleware`.

```php
class CreateNewArticle
{
    use AsAction;

    public function getControllerMiddleware(): array
    {
        return ['auth', MyCustomMiddleware::class];
    }

    // ...
}
```

## Предоставление другого ответа для JSON и HTML

Часто Вам нужно, чтобы Ваши контроллеры - и, следовательно, действия - были доступны как в виде веб-страницы, так и в качестве конечной точки JSON API. Скорее всего, Вы будете делать что-то подобное повсюду.

```php
if ($request->expectsJson()) {
    return new ArticleResource($article);
} else {
    return redirect()->route('articles.show', [$article]);
}
```

Вот почему Laravel Actions распознает два вспомогательных метода `jsonResponse` и `htmlResponse`, которые Вы можете использовать для разделения ответа на основе запроса, ожидающего JSON или нет.

Эти методы получают в качестве первого аргумента возвращаемое значение метода `asController`, а в качестве второго аргумента - объект `Request`.

```php
class CreateNewArticle
{
    use AsAction;

    public function handle(User $user, string $title, string $body): Article
    {
        return $user->articles()->create(compact('title', 'body'));
    }

    public function asController(User $user, Request $request): Article
    {
        return $this->handle($user, $request->get('title'), $request->get('body'));
    }

    public function htmlResponse(Article $article): Response
    {
        return redirect()->route('articles.show', [$article]);
    }

    public function jsonResponse(Article $article): ArticleResource
    {
        return new ArticleResource($article);
    }
}
```

## Регистрация маршрутов прямо в действии

Это не для всех, но если Вы действительно хотите вывести эту «единицу жизни» на следующий уровень, Вы можете определить свои маршруты прямо в действии, используя статический метод `routes`. В качестве первого аргумента он предоставляет `Router`.

```php
class GetArticlesFromAuthor
{
    use AsAction;

    public static function routes(Router $router)
    {
        $router->get('author/{author}/articles', static::class);
    }

    public function handle(User $author)
    {
        return $author->articles;
    }
}
```

Однако для того, чтобы это сработало, Вам нужно сообщить Laravel Actions, где находятся Ваши действия, чтобы он мог проходить через Ваши статические методы `routes`. Для этого все, что Вам нужно сделать, это вызвать метод `registerRoutes` фасада `Actions` у поставщика услуг. Он будет рекурсивно просматривать предоставленные папки.

```php
use Lorisleiva\Actions\Facades\Actions;

// Зарегистрируйте маршруты из действий в "app/Actions" (по умолчанию).
Actions::registerRoutes();

// Зарегистрируйте маршруты из действий в "app/MyCustomActionsFolder".
Actions::registerRoutes('app/MyCustomActionsFolder');

// Зарегистрируйте маршруты из действий в нескольких папках.
Actions::registerRoutes([
    'app/Authentication',
    'app/Billing',
    'app/TeamManagement',
]);
```

Теперь, когда мы знакомы с тем, как использовать действия в качестве контроллеров, давайте сделаем еще один шаг и посмотрим, как Laravel Actions могут обрабатывать [авторизацию и проверку при использовании в качестве контроллера](./add-validation-to-controllers).
