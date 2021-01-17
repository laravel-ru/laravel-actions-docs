# Добавление валидации в свои контроллеры

Один из способов добавить валидацию в Ваши контроллеры - это вставить `FormRequest` в Ваш метод `asController`, как если бы Вы это делали в контроллере.

```php
public function asController(MyFormRequest $request)
{
    // Авторизация и проверка, определенные в MyFormRequest, прошли успешно.
}
```

Однако это означает, что еще один класс, который тесно связан с этим действием, должен быть создан где-то еще в Вашем приложении - обычно в `app/Http/Requests`.

Вот почему Laravel Actions предоставляет специальный класс запроса под названием `ActionRequest`.

`ActionRequest` - это специальный класс `FormRequest`, который позволяет Вам **определять авторизацию и проверку прямо в Вашем действии**. Он будет искать определенные методы в Вашем действии и делегировать им, когда это необходимо.

```php
use Lorisleiva\Actions\ActionRequest;

public function asController(ActionRequest $request)
{
    // Авторизация и проверка, определенные в этом классе, прошли успешно.
}
```

На этой странице описаны эти специальные методы, которые Вы можете реализовать для определения Вашей авторизации и проверки.

## Авторизация

Как и в `FormRequest`, Вы можете реализовать метод `authorize`, который возвращает `true` тогда и только тогда, когда пользователю разрешен доступ к этому действию.

```php
public function authorize(ActionRequest $request): bool
{
    return $request->user()->role === 'author';
}
```

Вместо того, чтобы возвращать логическое значение, Вы также можете возвращать ответы шлюза, чтобы предоставить более подробный ответ.

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

Как и в случае `FormRequest`, он вернет исключение `AuthorizationException`, если авторизация не удалась. Вы можете предоставить свою собственную логику отказа авторизации, реализовав метод `getAuthorizationFailure`.

```php
public function getAuthorizationFailure(): void
{
    throw new MyCustomAuthorizationException();
}
```

## Добавление правил проверки

Вы можете реализовать метод `rules`, чтобы предоставить правила для проверки по данным запроса.

```php
public function rules(): array
{
    return [
        'title' => ['required', 'min:8'],
        'body' => ['required', IsValidMarkdown::class],
    ];
}
```

Затем Вы можете использовать метод `validated` внутри Вашего метода `asController` для доступа к данным запроса, которые прошли через Ваши правила проверки.

```php
public function asController(ActionRequest $request)
{
    $request->validated();
}
```

## Пользовательская логика проверки

В дополнение к Вашим правилам валидации `rules`, Вы можете предоставить метод `withValidator` для предоставления пользовательской логики валидации.

Он работает так же, как в `FormRequest`, и предоставляет валидатор в качестве первого аргумента, позволяя Вам добавить «обратные вызовы после проверки».


```php
use Illuminate\Validation\Validator;

public function withValidator(Validator $validator, ActionRequest $request): void
{
    $validator->after(function (Validator $validator) use ($request) {
        if (! Hash::check($request->get('current_password'), $request->user()->password)) {
            $validator->errors()->add('current_password', 'Wrong password.');
        }
    });
}
```

Очень часто, когда Вы используете `withValidator`, Вы просто хотите добавить обратный вызов `after` на валидаторе.

Действия Laravel позволяют Вам напрямую реализовать метод `afterValidator`, чтобы избежать вложенного обратного вызова.

```php
use Illuminate\Validation\Validator;

public function afterValidator(Validator $validator, ActionRequest $request): void
{
    if (! Hash::check($request->get('current_password'), $request->user()->password)) {
        $validator->errors()->add('current_password', 'Wrong password.');
    }
}
```

В качестве альтернативы, если Вы хотите получить полный контроль над сгенерированным валидатором, Вы можете вместо этого реализовать метод `getValidator`.

Реализация этого метода игнорирует любые другие методы проверки, такие как `rules`, `withValidator` и `afterValidator`.

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

## Подготовка для валидации

Как и в случае с `FormRequest`, Вы можете предоставить метод `prepareForValidation` для вставки некоторой настраиваемой логики перед запуском как авторизации, так и проверки.

```php
public function prepareForValidation(ActionRequest $request): void
{
    $request->merge(['some' => 'additional data']);
}
```

## Пользовательские сообщения проверки

Вы также можете настроить сообщения Ваших правил проверки и предоставить удобное для человека сопоставление с Вашими атрибутами запроса, реализовав методы `getValidationMessages` и `getValidationAttributes` соответственно.

```php
public function getValidationMessages(): array
{
    return [
        'title.required' => 'Похоже, ты забыл название.',
        'body.required' => 'Это действительно все, что ты хочешь сказать?',
    ];
}

public function getValidationAttributes(): array
{
    return [
        'title' => 'headline',
        'body' => 'content',
    ];
}
```

Обратите внимание, что предоставление метода `getValidator` также игнорирует оба этих метода.

## Ошибка пользовательской проверки

Как и в случае `FormRequest`, он вернет исключение `ValidationException`, если проверка не удалась. Это исключение по умолчанию будет перенаправлять на предыдущую страницу и использовать пакет ошибок по умолчанию `default` на валидаторе. Вы можете настроить оба этих поведения, реализовав методы `getValidationRedirect` и `getValidationErrorBag` соответственно.

```php
use Illuminate\Routing\UrlGenerator;

public function getValidationRedirect(UrlGenerator $url): string
{
    return $url->to('/my-custom-redirect-url');
}

public function getValidationErrorBag(): string
{
    return 'my_custom_error_bag';
}
```

В качестве альтернативы, Вы можете полностью переопределить возникшую ошибку валидации, реализовав метод `getValidationFailure`.

```php
public function getValidationFailure(): void
{
    throw new MyCustomValidationException();
}
```

Хорошо, насчет контроллеров, давайте теперь посмотрим, как мы можем [отправлять наши действия как асинхронные задания](./dispatch-jobs).
