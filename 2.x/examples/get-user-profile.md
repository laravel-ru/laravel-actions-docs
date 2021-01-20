# Получение профиля пользователя

## Определение

Простое действие, используемое для получения профиля пользователя через HTML или JSON.

```php
class GetUserProfile
{
    use AsAction;

    public function asController(User $user, Request $request): User
    {
        if ($request->expectsJson()) {
            return new UserProfileResource($user);
        }

        return view('users.show', compact('user'));
    }
}
```

Поскольку мы планируем использовать это действие только в качестве контроллера, мы можем использовать метод `handle` напрямую, и аргументы будут разрешены так же, как вызываемый контроллер.

Кроме того, мы можем использовать вспомогательные методы `htmlResponse` и `jsonResponse`, чтобы избежать этого распространенного оператора if.

Действие ниже эквивалентно приведенному выше.

```php
class GetUserProfile
{
    use AsAction;

    public function handle(User $user): User
    {
        return $user;
    }

    public function htmlResponse(User $user)
    {
        return view('users.show', compact('user'));
    }

    public function jsonResponse(User $user)
    {
        return new UserProfileResource($user);
    }
}
```

## Регистрация контроллера

Чтобы использовать его в качестве контроллера, просто зарегистрируйте действие в файле маршрутов.

```php
Route::get('users/{user}', GetUserProfile::class);
```

## Добавление мидлвара

Вместо определения мидлвара, в котором Вы определяете маршрут, Вы можете добавить их непосредственно в действие, например:

```php
class GetUserProfile
{
    use AsAction;

    public function getControllerMiddleware(): array
    {
        return ['auth', MyCustomMiddleware::class];
    }

    // ...
}
```
