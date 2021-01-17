# Отправка асинхронных заданий

## От задания к действию

Когда дело доходит до диспетчеризации Ваших действий как заданий, обычно бывает достаточно реализации метода `handle`. Причина этого в том, что Вы, вероятно, захотите использовать одни и те же аргументы при запуске действия как объекта (`MyAction::run`) и при отправке его как задания (`MyAction::dispatch`).

Например, предположим, что у Вас есть действие, которое отправляет электронное письмо с отчетом каждому члену команды.

```php
class SendTeamReportEmail
{
    use AsAction;

    public function handle(Team $team): void
    {
        // Подготовьте отчет и отправьте его всем $team->users.
    }
}
```

Используя этот метод `handle`, Вы отправите его как задание, запустив `SendTeamReportEmail::dispatch($someTeam)`.

Однако, если логика отправки задания отличается от метода `handle`, Вы можете реализовать метод `asJob`.

Например, мы можем захотеть отправить полный отчет только при отправке в виде задания.

```php
class SendTeamReportEmail
{
    use AsAction;

    public function handle(Team $team, bool $fullReport = false): void
    {
        // Подготовьте отчет и отправьте его всем $team->users.
    }

    public function asJob(Team $team): void
    {
        $this->handle($team, true);
    }
}
```

## Отправка заданий

### Асинхронно

Асинхронная отправка заданий может быть выполнена с помощью метода `dipatch`.

```php
SendTeamReportEmail::dispatch($team);
```

Это создаст новый объект `JobDecorator` и заключит в него Ваше действие.

Это означает, что Вы не можете отправить задание с помощью вспомогательного метода `dispatch`.

```php
// Это НЕ будет работать. ❌
dispatch(SendTeamReportEmail::make());
```

Если Вы должны использовать вспомогательный метод `dispatch`, тогда Вам нужно будет вместо этого использовать `makeJob` и передать ему аргументы действия.

```php
// Это будет работать. ✅
dispatch(SendTeamReportEmail::makeJob($team));
```

Вы также можете использовать методы `dispatchIf` и `dispatchUnless` для отправки задания при определенных условиях.

```php
SendTeamReportEmail::dispatchIf($team->hasAddon('reports'), $team);

SendTeamReportEmail::dispatchUnless($team->missesAddon('reports'), $team);
```

### Синхронно

Хотя Вы можете использовать `SendTeamReportEmail::run($team)` для немедленного выполнения действия, Вы также можете отправить синхронное задание с помощью методов `dispatchNow` или `dispatchSync`.

```php
SendTeamReportEmail::dispatchNow($team);

SendTeamReportEmail::dispatchSync($team);
```

### После того, как ответ был отправлен

Вы можете отложить выполнение действия после того, как ответ был отправлен пользователю, используя метод `dispatchAfterResponse`.

```php
SendTeamReportEmail::dispatchAfterResponse($team);
```

### С цепочкой

Наконец, Вы можете объединить несколько заданий в цепочку, используя метод `withChain`. Обязательно используйте метод `makeJob` для создания экземпляров связанных заданий - иначе Ваше действие не будет заключено в `JobDecorator`.

```php
$chain = [
    OptimizeTeamReport::makeJob($team),
    SendTeamReportEmail::makeJob($team),
];

CreateNewTeamReport::withChain($chain)->dispatch($team);
```

Обратите внимание, что Вы можете достичь того же результата, используя метод `chain` на фасаде `Bus`.

```php
use Illuminate\Support\Facades\Bus;

Bus::chain([
    CreateNewTeamReport::makeJob($team),
    OptimizeTeamReport::makeJob($team),
    SendTeamReportEmail::makeJob($team),
])->dispatch();
```

## Настройка заданий

При отправке задания Вы получите сообщение `PendingDispatch`, позволяющее связать любую конфигурацию задания, которая Вам нужна.

```php
SendTeamReportEmail::dispatch($team)
    ->onConnection('my_connection')
    ->onQueue('my_queue')
    ->through(['my_middleware'])
    ->chain(['my_chain'])
    ->delay(60);
}
```

Если Вы хотите настроить эти параметры в самом действии, чтобы они использовались по умолчанию при его отправке, Вы можете использовать метод `configureJob`. Он предоставит `JobDecorator` в качестве первого аргумента, который Вы можете использовать для объединения тех же конфигураций заданий, что и выше.

```php
use Lorisleiva\Actions\Decorators\JobDecorator;

public function configureJob(JobDecorator $job): void
{
    $job->onConnection('my_connection')
        ->onQueue('my_queue')
        ->through(['my_middleware'])
        ->chain(['my_chain'])
        ->delay(60);
}
```

Кроме того, Вы можете использовать любое из приведенных ниже свойств для дальнейшей настройки и/или корректировки логики повтора Ваших заданий.

```php
class SendTeamReportEmail
{
    use AsAction;

    public string $jobConnection = 'my_connection';
    public string $jobQueue = 'my_queue';
    public int $jobTries = 10;
    public int $jobMaxExceptions = 3;
    public int $jobBackoff = 60 * 5;
    public int $jobTimeout = 60 * 30;
    public int $jobRetryUntil = 3600 * 2;

    // ...
}
```

Поскольку Вы, возможно, захотите определить `backoff` и `retryUntil` динамически, Вы можете вместо этого использовать методы `getJobBackoff` и `getJobRetryUntil` соответственно.

```php
class SendTeamReportEmail
{
    use AsAction;

    public function getJobBackoff(): array
    {
        return [30, 60, 120];
    }

    public function getJobRetryUntil(): DateTime
    {
        return now()->addMinutes(30);
    }

    // ...
}
```

Также обратите внимание, что Вы можете использовать метод `configureJob` для установки свойств задания `tries`, `maxExceptions` и/или `timeout`.

```php
public function configureJob(JobDecorator $job): void
{
    $job->setTries(10)
        ->setMaxExceptions(3)
        ->setTimeout(60 * 30);
}
```

## Регистрация задания мидлвара

Вы также можете прикрепить к своим действиям мидлвар заданий, вернув их из метода `getJobMiddleware`.

```php
public function getJobMiddleware(): array
{
    return [new RateLimited('reports')];
}
```

## Пакетные задания

Обратите внимание, что также поддерживается пакетирование заданий. Просто используйте метод `makeJob` для создания множества заданий внутри пакета.

```php
$batch = Bus::batch([
    SendTeamReportEmail::makeJob($firstTeam),
    SendTeamReportEmail::makeJob($secondTeam),
    SendTeamReportEmail::makeJob($thirdTeam),
])->then(function (Batch $batch) {
    // Все задания успешно завершены...
})->catch(function (Batch $batch, Throwable $e) {
    // Обнаружен сбой первого пакетного задания...
})->finally(function (Batch $batch) {
    // Пакет завершил выполнение...
})->dispatch();
```

При отправке заданий в пакетном режиме Вы можете получить доступ к экземпляру `$batch` из метода `asJob`. Вы можете сделать это, добавив к аргументам `?Batch $batch`. Обратите внимание, что знак `?` важен, поскольку задание также может быть отправлено в обычном режиме, то есть не в пакете. Laravel Actions использует `Reflection` только для предоставления этого аргумента, когда Вы его запрашиваете.

```php
use Illuminate\Bus\Batch;

public function asJob(?Batch $batch, Team $team)
{
    if ($batch && $batch->cancelled()) {
        return;
    }

    $this->handle($team, true);
}
```

Обратите внимание, что Вы также можете ввести `JobDecorator` вместо `?Batch`, если Вам нужно.

```php
use Lorisleiva\Actions\Decorators\JobDecorator;

public function asJob(JobDecorator $job, Team $team)
{
    if ($job->batch() && $job->batch()->cancelled()) {
        return;
    }

    $this->handle($team, true);
}
```

## Уникальные задания

Фреймворк Laravel предоставляет трейт `ShouldBeUnique`, который Вы можете использовать в задании, чтобы гарантировать, что оно будет выполняться только один раз для данного идентификатора и в течение заданного периода времени. С традиционным заданием это выглядит так.

```php
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;

class SendTeamReportEmail implements ShouldQueue, ShouldBeUnique
{
    public Team $team;
    public int $uniqueFor = 3600;

    public function uniqueId()
    {
        return $this->team->id;
    }

    // ...
}
```

С помощью Laravel Actions Вы все еще можете добиться этого, добавив к своему действию трейт `ShouldBeUnique`.

- Чтобы определить уникальный идентификатор, Вы можете использовать свойство `$jobUniqueId` или метод `getJobUniqueId`.
- Чтобы определить количество времени, в течение которого задание должно оставаться уникальным, Вы можете использовать свойство `$jobUniqueFor` или метод `getJobUniqueFor`.

Когда Вы используете любой из этих методов, их аргументы будут такими же, как сами аргументы задания.

Например, приведенный выше пример можно переписать следующим образом:

```php
use Illuminate\Contracts\Queue\ShouldBeUnique;

class SendTeamReportEmail implements ShouldBeUnique
{
    use AsAction;

    public int $jobUniqueFor = 3600;

    public function getJobUniqueId(Team $team)
    {
        return $this->team->id;
    }

    // ...
}
```

По умолчанию драйвер кеша по умолчанию будет использоваться для получения блокировки и, следовательно, для поддержания уникальности отправляемых заданий. Вы можете указать, какой драйвер кеша использовать для определенного действия, реализовав метод `getJobUniqueVia`.

```php
public function getJobUniqueVia()
{
    return Cache::driver('redis');
}
```

Наконец, обратите внимание, что в Laravel теперь есть встроенный мидлвар для задания `WithoutOverlapping`, которое может ограничивать параллельную обработку задания. Если это все, что Вы пытаетесь достичь, возможно, стоит подумать об использовании этого мидлвара вместо трейта `ShouldBeUnique`.

## Теги вакансий и отображаемое имя

Если Вы используете Horizon, Вам может быть интересно предоставить настраиваемые теги для задания, чтобы отслеживать его и даже изменять его отображаемое имя.

Вы можете сделать это в действии, реализовав методы `getJobTags` и `getJobDisplayName` соответственно.

```php
class SendTeamReportEmail
{
    use AsAction;

    public function getJobTags(Team $team): array
    {
        return ['report', 'team:'.$team->id];
    }

    public function getJobDisplayName(): string
    {
        return 'Send team report email';
    }

    // ...
}
```

Обратите внимание, что вы можете получить аргументы задания из аргументов обоих этих методов.

## Утверждение заданий было выдвинуто

При отправке действий как задания Вы можете использовать `Queue::fake()` для подтверждения того, что определенное задание было передано Вашим тестам.

Например, вот как Вы утверждаете, что была отправлено обычное задание.

```php
Queue::fake();

// Сделай что-нибудь...

Queue::assertPushed(SendTeamReportEmail::class);
```

Однако, поскольку само действие заключено в `JobDecorator`, который действует как задание, Вы не можете сделать то же самое с действием. Вместо этого Вам нужно будет утверждать, что `JobDecorator` был отправлен, а затем добавить обратный вызов, который гарантирует, что `JobDecorator` украшает Ваше действие.

```php
Queue::fake();

// Сделай что-нибудь...

Queue::assertPushed(JobDecorator::class, function (JobDecorator $job) {
    return $job->decorates(SendTeamReportEmail::class);
});
```

По общему признанию, это намного труднее читать и довольно неудобно, если нам нужно делать это во всех наших тестах. Вот почему действия Laravel предоставляют статические вспомогательные методы для самого действия.

Чтобы утверждать, что определенное действие было отправлено как задание, все, что Вам нужно сделать, это использовать статический метод `assertPushed` непосредственно для действия. Приведенный выше пример можно переписать следующим образом:

```php
Queue::fake();

// Сделай что-нибудь...

SendTeamReportEmail::assertPushed();
```

Намного чище, не правда ли?

Вы также можете указать номер, чтобы утверждать, что задание отправлялось определенное количество раз.

```php
SendTeamReportEmail::assertPushed(3);
```

Или предоставьте обратный вызов, чтобы подтвердить, что задание, соответствующее этому условию, было отправлено. Обратный вызов получит следующие четыре аргумента:
1. Само действие. Здесь это будет экземпляр `SendTeamReportEmail`.
2. Аргументы работы. То есть аргументы, которые Вы указали при вызове `SendTeamReportEmail::dispatch(...)`.
3. `JobDecorator`, который украшает Ваше действие.
4. Имя использованной очереди.

```php
SendTeamReportEmail::assertPushed(function ($action, $arguments) {
    return ($team = $arguments[0])->hasAddon('reports');
});
```

Или Вы можете использовать как номер отправки, так и обратный вызов.

```php
SendTeamReportEmail::assertPushed(3, function ($action, $arguments) {
    return ($team = $arguments[0])->hasAddon('reports');
});
```

Наконец, Вы также можете использовать `assertNotPushed` и/или `assertPushedOn`, чтобы подтвердить, что задание не было отправлено и/или что оно было отправлено в конкретной очереди соответственно.

```php
SendTeamReportEmail::assertNotPushed();
SendTeamReportEmail::assertNotPushed($callback);
SendTeamReportEmail::assertPushedOn($queue);
SendTeamReportEmail::assertPushedOn($queue, $numberOfDispatch);
SendTeamReportEmail::assertPushedOn($queue, $callback);
SendTeamReportEmail::assertPushedOn($queue, $numberOfDispatch, $callback);
```

На следующей странице мы увидим [как заставить наши действия прислушиваться к событиям](./listen-for-events).
