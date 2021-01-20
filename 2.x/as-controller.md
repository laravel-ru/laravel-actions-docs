---
sidebarDepth: 2
---

# Как контролер

## Предоставляемый метод
*Перечисляет все методы, предоставляемые трейтом.*

### `__invoke`
Выполняет действие, немедленно делегируя его методу `handle`.

```php
$action($someArguments);

// Эквивалентно:
$action->handle($someArguments);
```

Хотя этот метод фактически не используется, он должен быть определен в действии, чтобы зарегистрировать действие как вызываемый контроллер. Если он отсутствует, Laravel выдаст исключение, предупреждающее нас о том, что мы пытаемся зарегистрировать класс как вызываемый контроллер без метода `__invoke`. На самом деле контроллер будет экземпляром `ControllerDecorator`, но фреймворк этого еще не знает.

```php
// Illuminate\Routing\RouteAction

protected static function makeInvokable($action)
{
    if (! method_exists($action, '__invoke')) {
        throw new UnexpectedValueException("Invalid route action: [{$action}].");
    }

    return $action.'@__invoke';
}
```

Если Вам нужно использовать метод `__invoke` для чего-то еще, Вы можете [переопределить его](https://stackoverflow.com/a/11939306/11440277) чем угодно. Единственное требование - наличие метода `__invoke`.

```php
class MyAction
{
    use AsAction {
        __invoke as protected invokeFromLaravelActions;
    }

    public function __invoke()
    {
        // ...
    }
}
```

## Используемый метод
*Перечисляет все методы, распознаваемые и используемые `ControllerDecorator` и `ActionRequest`.*

### `asController`
Вызывается при использовании в качестве вызываемого контроллера. Использует метод `handle` напрямую, когда метод `asController` не существует.

```php
public function asController(User $user, Request $request): Response
{
    $article = $this->handle(
        $user,
        $request->get('title'),
        $request->get('body')
    );

    return redirect()->route('articles.show', [$article]);
}
```

### `jsonResponse`
Вызывается после метода `asController` , когда запрос ожидает JSON. Первый аргумент - это возвращаемое значение метода `asController`, а второй аргумент - это сам запрос.

```php
public function jsonResponse(Article $article, Request $request): ArticleResource
{
    return new ArticleResource($article);
}
```

### `htmlResponse`
Вызывается после метода `asController` , когда запрос ожидает HTML. Первый аргумент - это возвращаемое значение метода `asController`, а второй аргумент - это сам запрос.

```php
public function htmlResponse(Article $article, Request $request): Response
{
    return redirect()->route('articles.show', [$article]);
}
```

### `getControllerMiddleware`
Добавляет мидлвар контроллера прямо в действие.

```php
public function getControllerMiddleware(): array
{
    return ['auth', MyCustomMiddleware::class];
}
```

### `routes`
Определяет некоторые маршруты прямо в Вашем действии.

```php
public static function routes(Router $router)
{
    $router->get('author/{author}/articles', static::class);
}
```

Чтобы это сработало, Вам нужно вызвать `Actions::registerRoutes` у сервис провайдера.

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

### `prepareForValidation`
Вызывается непосредственно перед разрешением авторизации и проверки.

```php
public function prepareForValidation(ActionRequest $request): void
{
    $request->merge(['some' => 'additional data']);
}
```

### `authorize`
Определяет логику авторизации для контроллера.

```php
public function authorize(ActionRequest $request): bool
{
    return $request->user()->role === 'author';
}
```

Вы также можете возвращать ответы ворот вместо логических значений.

```php
use use Illuminate\Auth\Access\Response;

public function authorize(ActionRequest $request): Response
{
    if ($request->user()->role !== 'author') {
        return Response::deny('Вы должны быть автором, чтобы создать новую статью.');
    }

    return Respone::allow();
}
```

### `rules`
Предоставляет правила проверки для контроллера.

```php
public function rules(): array
{
    return [
        'title' => ['required', 'min:8'],
        'body' => ['required', IsValidMarkdown::class],
    ];
}
```

### `withValidator`
Добавляет настраиваемую логику проверки к существующему валидатору.

```php
use Illuminate\Validation\Validator;

public function withValidator(Validator $validator, ActionRequest $request): void
{
    $validator->after(function (Validator $validator) use ($request) {
        if (! Hash::check($request->get('current_password'), $request->user()->password)) {
            $validator->errors()->add('current_password', 'Неправильный пароль.');
        }
    });
}
```

### `afterValidator`
Добавляет обратный вызов `after` к существующему валидатору. Пример ниже эквивалентен примеру, предоставленному в методе `withValidator`.

```php
use Illuminate\Validation\Validator;

public function afterValidator(Validator $validator, ActionRequest $request): void
{
    if (! Hash::check($request->get('current_password'), $request->user()->password)) {
        $validator->errors()->add('current_password', 'Неправильный пароль.');
    }
}
```

### `getValidator`
Определяет ваш собственный валидатор вместо валидатора по умолчанию, созданного с помощью `rules`, `withValidator` и т. д.

```php
use Illuminate\Validation\Factory;
use Illuminate\Validation\Validator;

public function getValidator(Factory $factory, ActionRequest $request): Validator
{
    return $factory->make($request->only('title', 'body'), [
        'title' => ['required', 'min:8'],
        'body' => ['required', IsValidMarkdown::class],
    ]);
}
```

### `getValidationData`
Определяет данные, которые следует использовать для проверки. По умолчанию: `$request->all()`.

```php
public function getValidationData(ActionRequest $request): array
{
    return $request->all();
}
```

### `getValidationMessages`
Настраивает сообщения Ваших правил проверки.

```php
public function getValidationMessages(): array
{
    return [
        'title.required' => 'Похоже, вы забыли название.',
        'body.required' => 'Это действительно все, что ты хочешь сказать?',
    ];
}
```

### `getValidationAttributes`
Обеспечивает удобное для человека отображение атрибутов Вашего запроса.

```php
public function getValidationAttributes(): array
{
    return [
        'title' => 'headline',
        'body' => 'content',
    ];
}
```

### `getValidationRedirect`
Настраивает URL-адрес перенаправления в случае сбоя проверки. По умолчанию выполняется обратное перенаправление на предыдущую страницу.

```php
public function getValidationRedirect(UrlGenerator $url): string
{
    return $url->to('/my-custom-redirect-url');
}
```

### `getValidationErrorBag`
Настраивает пакет ошибок валидатора в случае сбоя проверки. По умолчанию: `default`.

```php
public function getValidationErrorBag(): string
{
    return 'my_custom_error_bag';
}
```

### `getValidationFailure`
Полностью заменяет ошибку проверки. По умолчанию: `ValidationException`.

```php
public function getValidationFailure(): void
{
    throw new MyCustomValidationException();
}
```

### `getAuthorizationFailure`
Заменяет ошибку авторизации. По умолчанию: `AuthorizationException`.

```php
public function getAuthorizationFailure(): void
{
    throw new MyCustomAuthorizationException();
}
```
