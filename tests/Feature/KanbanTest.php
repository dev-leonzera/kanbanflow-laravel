<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Card;
use App\Models\Column;
use App\Models\Label;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KanbanTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_move_card_between_columns_via_move_endpoint(): void
    {
        $user = User::factory()->create();
        $board = Board::create(['user_id' => $user->id, 'title' => 'Main Board']);
        $col1 = Column::create(['board_id' => $board->id, 'title' => 'Col 1', 'order_position' => 0]);
        $col2 = Column::create(['board_id' => $board->id, 'title' => 'Col 2', 'order_position' => 1]);

        $card = Card::create([
            'column_id' => $col1->id,
            'title' => 'Task 1',
            'order_position' => 0,
        ]);

        $response = $this->actingAs($user)->patch(route('cards.move', $card), [
            'column_id' => $col2->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cards', [
            'id' => $card->id,
            'column_id' => $col2->id,
        ]);
    }

    public function test_user_can_move_card_between_columns_via_update_endpoint(): void
    {
        $user = User::factory()->create();
        $board = Board::create(['user_id' => $user->id, 'title' => 'Main Board']);
        $col1 = Column::create(['board_id' => $board->id, 'title' => 'Col 1', 'order_position' => 0]);
        $col2 = Column::create(['board_id' => $board->id, 'title' => 'Col 2', 'order_position' => 1]);

        $card = Card::create([
            'column_id' => $col1->id,
            'title' => 'Task 1',
            'order_position' => 0,
        ]);

        $response = $this->actingAs($user)->put(route('cards.update', $card), [
            'title' => 'Updated Task',
            'column_id' => $col2->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('cards', [
            'id' => $card->id,
            'title' => 'Updated Task',
            'column_id' => $col2->id,
        ]);
    }

    public function test_user_can_create_update_and_delete_labels(): void
    {
        $user = User::factory()->create();
        $board = Board::create(['user_id' => $user->id, 'title' => 'Main Board']);

        // Create label
        $response = $this->actingAs($user)->post(route('labels.store', $board), [
            'name' => 'Bug',
            'color_hex' => '#ef4444',
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('labels', [
            'board_id' => $board->id,
            'name' => 'Bug',
            'color_hex' => '#ef4444',
        ]);

        $label = Label::where('name', 'Bug')->first();

        // Update label
        $updateResponse = $this->actingAs($user)->put(route('labels.update', $label), [
            'name' => 'Critical Bug',
            'color_hex' => '#dc2626',
        ]);
        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('labels', [
            'id' => $label->id,
            'name' => 'Critical Bug',
            'color_hex' => '#dc2626',
        ]);

        // Delete label
        $deleteResponse = $this->actingAs($user)->delete(route('labels.destroy', $label));
        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('labels', [
            'id' => $label->id,
        ]);
    }

    public function test_user_cannot_move_or_reorder_cards_on_another_users_board(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $board1 = Board::create(['user_id' => $user1->id, 'title' => 'User1 Board']);
        $col1 = Column::create(['board_id' => $board1->id, 'title' => 'Col 1', 'order_position' => 0]);
        $card1 = Card::create(['column_id' => $col1->id, 'title' => 'Card 1', 'order_position' => 0]);

        $board2 = Board::create(['user_id' => $user2->id, 'title' => 'User2 Board']);
        $col2 = Column::create(['board_id' => $board2->id, 'title' => 'Col 2', 'order_position' => 0]);

        // user2 tries to move user1's card
        $response = $this->actingAs($user2)->patch(route('cards.move', $card1), [
            'column_id' => $col2->id,
        ]);
        $response->assertForbidden();

        // user2 tries to reorder
        $reorderResponse = $this->actingAs($user2)->post(route('cards.reorder'), [
            'column_id' => $col2->id,
            'card_orders' => [
                ['id' => $card1->id, 'order_position' => 0],
            ],
        ]);
        $reorderResponse->assertForbidden();
    }
}

